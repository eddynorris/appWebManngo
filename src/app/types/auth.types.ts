export interface AuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: User;
}

export interface User {
  id: number;
  username: string;
  rol: string;
  almacen_id: number;
  almacen_nombre: string;
}
