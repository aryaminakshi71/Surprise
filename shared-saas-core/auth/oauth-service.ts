import { authService, TokenPayload } from './auth-service';

interface OAuthConfig {
  google: {
    clientId: string;
    clientSecret: string;
    redirectUri: string;
  };
  github: {
    clientId: string;
    clientSecret: string;
    redirectUri: string;
  };
}

const config: OAuthConfig = {
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    redirectUri: process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/auth/google/callback',
  },
  github: {
    clientId: process.env.GITHUB_CLIENT_ID || '',
    clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
    redirectUri: process.env.GITHUB_REDIRECT_URI || 'http://localhost:3000/api/auth/github/callback',
  },
};

export interface OAuthUser {
  provider: 'google' | 'github';
  id: string;
  email: string;
  name: string;
  picture?: string;
}

export interface OAuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
}

class OAuthService {
  getGoogleAuthUrl(state: string): string {
    const params = new URLSearchParams({
      client_id: config.google.clientId,
      redirect_uri: config.google.redirectUri,
      response_type: 'code',
      scope: 'openid email profile',
      access_type: 'offline',
      prompt: 'consent',
      state,
    });

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  getGitHubAuthUrl(state: string): string {
    const params = new URLSearchParams({
      client_id: config.github.clientId,
      redirect_uri: config.github.redirectUri,
      scope: 'read:user user:email',
      state,
    });

    return `https://github.com/login/oauth/authorize?${params.toString()}`;
  }

  async exchangeGoogleCode(code: string): Promise<OAuthTokens> {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: config.google.clientId,
        client_secret: config.google.clientSecret,
        grant_type: 'authorization_code',
        redirect_uri: config.google.redirectUri,
      }),
    });

    const data = await response.json();
    
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresIn: data.expires_in,
    };
  }

  async exchangeGitHubCode(code: string): Promise<OAuthTokens> {
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        code,
        client_id: config.github.clientId,
        client_secret: config.github.clientSecret,
      }),
    });

    const data = await tokenResponse.json();
    
    return {
      accessToken: data.access_token,
      expiresIn: 3600 * 24 * 30,
    };
  }

  async getGoogleUser(accessToken: string): Promise<OAuthUser> {
    const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const data = await response.json();
    
    return {
      provider: 'google',
      id: data.id,
      email: data.email,
      name: data.name,
      picture: data.picture,
    };
  }

  async getGitHubUser(accessToken: string): Promise<OAuthUser> {
    const userResponse = await fetch('https://api.github.com/user', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const userData = await userResponse.json();

    const emailResponse = await fetch('https://api.github.com/user/emails', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const emails = await emailResponse.json();
    const primaryEmail = emails.find((e: any) => e.primary)?.email || userData.email;

    return {
      provider: 'github',
      id: userData.id.toString(),
      email: primaryEmail,
      name: userData.name || userData.login,
      picture: userData.avatar_url,
    };
  }

  async handleOAuthCallback(
    provider: 'google' | 'github',
    code: string,
    state: string
  ): Promise<{ user: OAuthUser; tokens: TokenPayload }> {
    let tokens: OAuthTokens;
    let user: OAuthUser;

    if (provider === 'google') {
      tokens = await this.exchangeGoogleCode(code);
      user = await this.getGoogleUser(tokens.accessToken);
    } else {
      tokens = await this.exchangeGitHubCode(code);
      user = await this.getGitHubUser(tokens.accessToken);
    }

    const tokenPayload: TokenPayload = {
      userId: `${provider}-${user.id}`,
      email: user.email,
      role: 'user',
      companyId: 'default',
    };

    const authTokens = authService.generateTokens(tokenPayload);

    return { user, tokens: authTokens };
  }
}

export const oauthService = new OAuthService();
