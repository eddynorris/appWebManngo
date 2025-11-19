export type AuthResponse = {
  access_token: string;
  user: User;
};

export type DecodedToken = {
  sub: string; // User ID or username
  rol: 'admin' | 'usuario' | 'almacenero'; // User roles
  almacen_id?: number; // Optional warehouse ID
  iat: number; // Issued at
  exp: number; // Expiration time
};

export interface User {
  id: number;
  username: string;
  rol: string;
  almacen_id: number;
  almacen_nombre: string;
}
