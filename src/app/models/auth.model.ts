export interface LoginResponse {
  message: string;
  user: {
    id: number;
    name: string;
    email: string;
    role_id: number;
    role_name: string;
    company?: { id: number; name: string };
  };
  accessToken: string;
}

export interface SignupResponse {
  message: string;
  user: {
    id: number;
    email: string;
    first_name: string;
    second_name: string;
    role_id: number;
    company?: {
      id: number;
      name: string;
      address: string | null;
      postal_code: string | null;
    };
  };
  accessToken: string;
}

export interface SeekerSignupResponse {
  message: string;
  user: {
    id: number;
    email: string;
    first_name: string;
    second_name: string;
    role_id: number;
    education_level: string;
    institution: string;
    skills: string[];
    cv: string | null;
  };
  accessToken: string;
}