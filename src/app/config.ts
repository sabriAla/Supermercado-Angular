// El front pide la API al mismo origen ('/api' y '/auth'):
//  - con Docker, nginx las reenvía al gateway (ver nginx.conf)
//  - con `ng serve`, las reenvía proxy.conf.json a http://localhost:8080
export const API_URL = '';

// true  = el front funciona solo, con datos de prueba (sin backend)
// false = el front le pega al gateway de verdad
export const USAR_MOCK = false;
