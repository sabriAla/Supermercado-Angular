# Supermercado — Frontend (Angular)

Frontend del sistema de supermercado. Consume la API a través del API Gateway
(repositorio del backend: https://github.com/Camssm/Supermercado).

Generado con [Angular CLI](https://github.com/angular/angular-cli) 17.3.17.

## Funcionalidades

- Login y registro de usuarios
- Galería de productos (pública)
- Carrito y registro de compras (CLIENTE)
- Listado de facturas
- Gestión de productos y stock (ADMIN)

## Configuración

En `src/app/config.ts`:

```ts
export const API_URL = '';        // la API se pide al mismo origen (/api y /auth)
export const USAR_MOCK = false;   // true = datos de prueba, sin backend
```

La API se pide al mismo origen que el front:

- Con `ng serve`, `proxy.conf.json` reenvía `/api` y `/auth` a `http://localhost:8080` (el gateway).
- Con Docker, `nginx.conf` las reenvía al contenedor `gateway`.

Poné `USAR_MOCK = true` para trabajar sin backend.

## Ejecutar en desarrollo

Requisitos: Node.js 18 o superior y el backend levantado (gateway en `http://localhost:8080`).

```
npm install
ng serve
```

Abrir http://localhost:4200

## Ejecutar con Docker

El frontend se levanta junto con el backend desde el `docker-compose.yml` del repositorio `Supermercado`,
que descarga este repositorio (rama `main`) y lo construye:

```
docker compose up --build -d
```

Abrir http://localhost:4200.

Para construir solo esta imagen (el contenedor necesita estar en la misma red que el gateway):

```
docker build -t supermercado-frontend .
```

## Estructura

```
src/app/
  componentes/   login, productos, carrito, facturas, gestion
  servicios/     auth, login, producto, factura, carrito
  guards/        login.guard, rol.guard
  interceptores/ auth.interceptor (agrega el JWT)
nginx.conf       sirve la app y reenvía /api y /auth al gateway
proxy.conf.json  lo mismo para ng serve
Dockerfile       build multi-stage (Node + nginx)
```
