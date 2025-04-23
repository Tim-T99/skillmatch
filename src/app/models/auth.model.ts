export interface SignupResponse {
  message: string;
  refreshToken?: string;
  user: {
    id: number;
    email: string;
    first_name: string;
    second_name: string;
    role_id: number;
    company?: { id: number; name: string; address?: string; postal_code?: string };
  };
  accessToken: string;
}

export interface SeekerSignupResponse {
  message: string;
  refreshToken?: string;
  user: {
    id: number;
    email: string;
    first_name: string;
    second_name: string;
    role_id: number;
    education_level: string;
    institution: string;
    skills: string[];
    cv?: string;
  };
  accessToken: string;
}

export interface LoginResponse {
  message: string;
  refreshToken?: string;
  user: {
    id: number;
    email: string;
    role_id: number;
    name: string;
    company?: { id: number; name: string };
    cv?: string;
    role_name?: string;
  };
  accessToken: string;
}