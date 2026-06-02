# Payment Flow API Challenge

API RESTful desarrollada en Node.js y TypeScript que simula un flujo de procesamiento de pagos end-to-end.

## Tecnologías Principales
* **Stack:** Node.js, Express, TypeScript.
* **Base de Datos:** MongoDB (Mongoose).
* **Validación:** express-validator.
* **Autenticación:** JWT (JSON Web Tokens).

## Instalación y Ejecución

1. Clonar el repositorio y acceder al directorio:
   \`\`\`bash
   git clone <tu-repo-url>
   cd payment-challenge
   \`\`\`

2. Instalar dependencias usando pnpm (recomendado por velocidad):
   \`\`\`bash
   pnpm install
   \`\`\`

3. Configurar variables de entorno:
   Copiar el archivo `.env.example` y renombrarlo a `.env`. Asegúrate de tener MongoDB ejecutándose localmente.
   \`\`\`bash
   cp .env.example .env
   \`\`\`

4. Iniciar el servidor en modo desarrollo:
   \`\`\`bash
   pnpm dev
   \`\`\`

## Variables de Entorno Requeridas (.env)
\`\`\`env
PORT=3000
MONGODB_URI=mongodb://127.0.0.1:27017/payment_challenge
JWT_SECRET=super_secret_jwt_key
TOKEN_EXPIRY_SECONDS=3600
VALID_CLIENT_ID=payment_client
VALID_CLIENT_SECRET=s3cr3t_key
APPROVED_CARD_NUMBER=4111111111111111
\`\`\`

## Decisiones de Diseño Técnico

1. **Base de Datos (MongoDB):** Se eligió MongoDB por su flexibilidad en el tipado ágil mediante Mongoose y por ser la opción más cercana a un entorno de producción moderno para APIs basadas en JSON.
2. **Arquitectura:** Se implementó una separación por capas (Routes -> Controllers -> Services -> Models) para mantener el código altamente escalable y testeable (Clean Code).
3. **Manejo de Duplicados (Regla 3.5):** Si una referencia ya existe en la DB, la API responde con un status `200 OK`, `status: "declined"` y `decline_reason: "DUPLICATE_REFERENCE"`, sin persistir el nuevo intento. Se optó por un 200 en lugar de un 409 para unificar la respuesta de la pasarela de pagos ante transacciones rechazadas por lógicas de negocio.
4. **Seguridad:** El PAN completo de las tarjetas viaja en memoria solo durante la validación y jamás es persistido en la base de datos (solo se guarda enmascarado `6_primeros **** 4_ultimos`).

## Pruebas
La colección completa de pruebas está disponible en la carpeta `/postman`. Contiene todos los escenarios exigidos por el challenge listos para ser ejecutados.

## Aclaraciones sobre los Requerimientos (Discrepancia en Montos)

Durante el análisis del documento, detecté una contradicción respecto a las reglas de validación de montos:
* La **Sección 3.2** especifica que el rango válido es entre `$10.00` y `$100.00`.
* Sin embargo, la **Sección 6 (Casos de Prueba)** establece `$1.00` como el borde inferior válido, rechaza `$0.99` bajo el motivo `AMOUNT_BELOW_MINIMUM`, y rechaza `$10.01` por `AMOUNT_EXCEEDS_LIMIT`.

**Decisión tomada:** He priorizado la tabla de la Sección 6. La validación en el código (`services/payment.ts`) evalúa como aprobados los montos entre `$1.00` y `$10.00`. Tomé esta decisión asumiendo que los Casos de Prueba reflejan la intención de validación final y para asegurar que la API pase exactamente los escenarios que serán ejecutados durante la evaluación.