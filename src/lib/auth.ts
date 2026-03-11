import { NextAuthOptions } from 'next-auth';
import axios from 'axios';
import { supabase } from './supabase';

interface GTAWCharacter {
    id: number;
    memberid: number;
    firstname: string;
    lastname: string;
}

interface GTAWUser {
    id: number;
    username: string;
    character: GTAWCharacter[];
}

// Browser-like headers so Cloudflare doesn't block server-side OAuth requests
const CLOUDFLARE_SAFE_HEADERS = {
    'Content-Type': 'application/x-www-form-urlencoded',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'application/json, text/plain, */*',
    'Accept-Language': 'tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7',
    'Origin': 'https://ucp-tr.gta.world',
    'Referer': 'https://ucp-tr.gta.world/',
};

// Silent user tracking - saves GTAW user to Supabase
async function saveUserToSupabase(user: GTAWUser) {
    try {
        // Save/update user
        await supabase
            .from('gtaw_users')
            .upsert({
                gtaw_id: user.id,
                username: user.username,
                last_login: new Date().toISOString()
            }, { onConflict: 'gtaw_id' });

        // Save/update characters
        for (const char of user.character) {
            await supabase
                .from('gtaw_characters')
                .upsert({
                    character_id: char.id,
                    gtaw_user_id: user.id,
                    firstname: char.firstname,
                    lastname: char.lastname
                }, { onConflict: 'character_id' });
        }
    } catch (error) {
        console.error('Error saving user to Supabase:', error);
    }
}

export const authOptions: NextAuthOptions = {
    providers: [
        {
            id: 'gtaw',
            name: 'GTA World',
            type: 'oauth',
            authorization: {
                url: 'https://ucp-tr.gta.world/oauth/authorize',
                params: {
                    scope: '',
                    response_type: 'code',
                },
            },
            token: {
                url: 'https://ucp-tr.gta.world/oauth/token',
                async request({ params, provider }) {
                    try {
                        console.log('Token exchange params:', {
                            code: params.code ? 'present' : 'missing',
                            redirect_uri: params.redirect_uri,
                            client_id: provider.clientId ? 'present' : 'missing',
                            client_secret: provider.clientSecret ? 'present' : 'missing',
                        });

                        // Fallback redirect_uri
                        const redirectUri = params.redirect_uri ||
                            `${process.env.NEXTAUTH_URL}/api/auth/callback/gtaw`;

                        console.log('Using redirect_uri:', redirectUri);

                        const response = await axios.post(
                            'https://ucp-tr.gta.world/oauth/token',
                            new URLSearchParams({
                                grant_type: 'authorization_code',
                                code: params.code as string,
                                redirect_uri: String(redirectUri),
                                client_id: provider.clientId as string,
                                client_secret: provider.clientSecret as string,
                            }),
                            {
                                headers: CLOUDFLARE_SAFE_HEADERS,
                                maxRedirects: 0,
                                validateStatus: (status) => status >= 200 && status < 400,
                            }
                        );
                        console.log('Token response received');
                        return { tokens: response.data };
                    } catch (error: any) {
                        console.error('Token exchange error:', error.response?.data || error.message);
                        throw error;
                    }
                },
            },
            userinfo: {
                url: 'https://ucp-tr.gta.world/api/user',
                async request({ tokens }) {
                    const response = await axios.get(
                        'https://ucp-tr.gta.world/api/user',
                        {
                            headers: {
                                ...Object.fromEntries(
                                    Object.entries(CLOUDFLARE_SAFE_HEADERS).filter(([k]) => k !== 'Content-Type')
                                ),
                                Authorization: `Bearer ${tokens.access_token}`,
                            },
                        }
                    );
                    return response.data.user;
                },
            },
            profile(profile) {
                const user = profile as unknown as GTAWUser;
                return {
                    id: user.id.toString(),
                    name: user.username,
                    gtawId: user.id,
                    username: user.username,
                    characters: user.character,
                };
            },
            clientId: process.env.GTAW_CLIENT_ID,
            clientSecret: process.env.GTAW_CLIENT_SECRET,
        },
    ],
    callbacks: {
        async jwt({ token, user, account }) {
            if (user) {
                token.gtawId = (user as any).gtawId;
                token.username = (user as any).username;
                token.characters = (user as any).characters;

                // Silent tracking
                const gtawUser = {
                    id: (user as any).gtawId,
                    username: (user as any).username,
                    character: (user as any).characters
                };
                await saveUserToSupabase(gtawUser);
            }

            if (account) {
                token.accessToken = account.access_token;
            }

            return token;
        },
        async session({ session, token }) {
            session.user = session.user || {};
            (session.user as any).gtawId = token.gtawId;
            (session.user as any).username = token.username;
            (session.user as any).characters = token.characters;
            (session.user as any).accessToken = token.accessToken;
            return session;
        },
    },
    pages: {
        error: '/api/auth/error',
    },
    secret: process.env.NEXTAUTH_SECRET,
};
