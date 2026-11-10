# Parte 1

### **Pregunta 1:**

### ¿qué código recibe el cliente con PostgreSQL parado?

El cliente recibira lo siguiente:

> {"statusCode":500,"message":"Internal server error"}

### ¿Qué ves en la terminal que el cliente no ve?

>
>
> ```bash
> Error: connect ECONNREFUSED 127.0.0.1:5433
>
>     at createConnectionError (node:net:2124:14)
>
>     at afterConnectMultiple (node:net:2154:16) {
>
>   errno: -4078,
>
>   code: 'ECONNREFUSED',
>
>   syscall: 'connect',
>
>   address: '127.0.0.1',
>
>   port: 5433
>
> }
> ```

### ¿Por qué es mejor así?

Porque para el usuario no le abrumara tanto el error como al administrador