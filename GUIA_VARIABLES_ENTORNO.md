# Guía para Configurar las Variables de Entorno

Esta guía te ayudará a obtener todas las variables de entorno necesarias para que tu proyecto funcione correctamente.

## 📋 Variables Necesarias

1. `AUTH_SECRET` - Secreto para Auth.js
2. `AUTH_GOOGLE_ID` - ID del Cliente OAuth de Google
3. `AUTH_GOOGLE_SECRET` - Secreto del Cliente OAuth de Google
4. `SPREADSHEET_ID` - ID de tu Google Spreadsheet
5. `GOOGLE_SERVICE_ACCOUNT_EMAIL` - Email de la cuenta de servicio
6. `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY` - Clave privada de la cuenta de servicio
7. `GOOGLE_DRIVE_FOLDER_ID` - ID de la carpeta en Google Drive para almacenar imágenes

---

## 1️⃣ Generar AUTH_SECRET

Esta es la más fácil. Ejecuta en tu terminal:

```powershell
npx auth secret
```

Copia el valor generado y úsalo en tu archivo `.env.local`.

**Ejemplo:**
```
AUTH_SECRET=tu_secreto_generado_aqui
```

---

## 2️⃣ Configurar Google OAuth (AUTH_GOOGLE_ID y AUTH_GOOGLE_SECRET)

### Paso 1: Crear un Proyecto en Google Cloud Console

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Haz clic en el selector de proyectos (arriba a la izquierda)
3. Haz clic en **"NUEVO PROYECTO"**
4. Dale un nombre (ej: "Catálogo CMS")
5. Haz clic en **"CREAR"**

### Paso 2: Habilitar las APIs necesarias

1. En el menú lateral, ve a **"APIs y servicios"** > **"Biblioteca"**
2. Busca y habilita las siguientes APIs:
   - **"Google Sheets API"** - Haz clic en **"HABILITAR"**
   - **"Google Drive API"** - Haz clic en **"HABILITAR"** (necesaria para subir imágenes al Drive del usuario)

### Paso 3: Configurar la Pantalla de Consentimiento OAuth

1. Ve a **"APIs y servicios"** > **"Pantalla de consentimiento OAuth"**
2. Selecciona **"Externo"** (a menos que tengas una cuenta de Google Workspace)
3. Haz clic en **"CREAR"**
4. Completa la información:
   - **Nombre de la app**: Catálogo CMS (o el que prefieras)
   - **Email de soporte**: Tu email
   - **Email del desarrollador**: Tu email
5. Haz clic en **"GUARDAR Y CONTINUAR"**
6. En **"Scopes"**, haz clic en **"GUARDAR Y CONTINUAR"** (los scopes se configurarán en las credenciales)
7. En **"Usuarios de prueba"**, agrega tu email si es necesario
8. Haz clic en **"GUARDAR Y CONTINUAR"**

### Paso 4: Crear Credenciales OAuth 2.0

1. Ve a **"APIs y servicios"** > **"Credenciales"**
2. Haz clic en **"+ CREAR CREDENCIALES"** > **"ID de cliente de OAuth 2.0"**
3. Selecciona **"Aplicación web"**
4. Configura:
   - **Nombre**: Catálogo CMS Client
   - **URI de redirección autorizados**: 
     - Para desarrollo local: `http://localhost:3000/api/auth/callback/google`
     - Para producción: `https://tu-dominio.com/api/auth/callback/google`
5. Haz clic en **"CREAR"**
6. **¡IMPORTANTE!** Copia inmediatamente:
   - **ID de cliente** → Este es tu `AUTH_GOOGLE_ID`
   - **Secreto de cliente** → Este es tu `AUTH_GOOGLE_SECRET` (solo se muestra una vez)

**Ejemplo en `.env.local`:**
```
AUTH_GOOGLE_ID=123456789-abcdefghijklmnop.apps.googleusercontent.com
AUTH_GOOGLE_SECRET=GOCSPX-tu_secreto_aqui
```

---

## 3️⃣ Obtener SPREADSHEET_ID

### Paso 1: Crear o Abrir tu Google Spreadsheet

1. Ve a [Google Sheets](https://sheets.google.com/)
2. Crea una nueva hoja de cálculo o abre una existente

### Paso 2: Obtener el ID del Spreadsheet

El ID está en la URL de tu spreadsheet:
```
https://docs.google.com/spreadsheets/d/SPREADSHEET_ID_AQUI/edit#gid=0
```

Copia el ID que está entre `/d/` y `/edit`.

**Ejemplo en `.env.local`:**
```
SPREADSHEET_ID=1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms
```

### Paso 3: Configurar la Estructura del Spreadsheet

Asegúrate de que tu spreadsheet tenga una primera fila con encabezados. Por ejemplo:

| id | name | description | price | image |
|----|------|-------------|-------|-------|
| 1  | Producto 1 | Descripción... | 100 | https://... |

---

## 4️⃣ Configurar Cuenta de Servicio (GOOGLE_SERVICE_ACCOUNT_EMAIL y GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY)

### Paso 1: Crear una Cuenta de Servicio

1. En Google Cloud Console, ve a **"APIs y servicios"** > **"Credenciales"**
2. Haz clic en **"+ CREAR CREDENCIALES"** > **"Cuenta de servicio"**
3. Completa:
   - **Nombre**: catalog-service-account (o el que prefieras)
   - **ID**: Se genera automáticamente
   - **Descripción**: Cuenta de servicio para acceso a Google Sheets
4. Haz clic en **"CREAR Y CONTINUAR"**
5. En **"Otorgar a esta cuenta de servicio acceso al proyecto"**, puedes omitir este paso por ahora
6. Haz clic en **"CONTINUAR"** y luego en **"LISTO"**

### Paso 2: Generar Clave JSON

1. En la lista de cuentas de servicio, haz clic en la que acabas de crear
2. Ve a la pestaña **"CLAVES"**
3. Haz clic en **"AGREGAR CLAVE"** > **"Crear nueva clave"**
4. Selecciona **"JSON"**
5. Haz clic en **"CREAR"**
6. Se descargará un archivo JSON. **¡Guárdalo de forma segura!**

### Paso 3: Extraer Información del JSON

Abre el archivo JSON descargado. Debería verse así:

```json
{
  "type": "service_account",
  "project_id": "tu-proyecto",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "catalog-service-account@tu-proyecto.iam.gserviceaccount.com",
  ...
}
```

**Extrae estos valores:**
- `client_email` → Este es tu `GOOGLE_SERVICE_ACCOUNT_EMAIL`
- `private_key` → Este es tu `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY`

**⚠️ IMPORTANTE para la clave privada:**
- Debes mantener las comillas alrededor del valor
- Debes mantener los `\n` (saltos de línea) tal como están
- El valor completo debe estar en una sola línea en el `.env.local`

**Ejemplo en `.env.local`:**
```
GOOGLE_SERVICE_ACCOUNT_EMAIL=catalog-service-account@tu-proyecto.iam.gserviceaccount.com
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n"
```

### Paso 4: Compartir el Spreadsheet con la Cuenta de Servicio

1. Abre tu Google Spreadsheet
2. Haz clic en el botón **"Compartir"** (arriba a la derecha)
3. En el campo de email, pega el `GOOGLE_SERVICE_ACCOUNT_EMAIL`
4. Dale permisos de **"Editor"**
5. **Desmarca** la opción "Notificar a las personas" (no es necesario)
6. Haz clic en **"Compartir"**

---

## 5️⃣ Configurar Google Drive para Imágenes (GOOGLE_DRIVE_FOLDER_ID) - OPCIONAL

**Nota:** Los archivos se suben al Google Drive del usuario autenticado usando OAuth. La carpeta es opcional - si no se especifica, los archivos se suben a la raíz del Drive del usuario.

### Paso 1: Habilitar el Scope de Google Drive en OAuth

El scope de Google Drive ya está incluido en la configuración de OAuth. Solo necesitas asegurarte de que la API de Google Drive esté habilitada en Google Cloud Console (ver paso 2 de la sección 2).

### Paso 2: Crear una Carpeta en Google Drive (Opcional)

Si quieres organizar las imágenes en una carpeta específica:

1. Ve a [Google Drive](https://drive.google.com/)
2. Haz clic en **"Nuevo"** > **"Carpeta"**
3. Dale un nombre (ej: "Catalogo Imagenes")
4. Haz clic en **"Crear"**

### Paso 3: Obtener el ID de la Carpeta (Opcional)

1. Abre la carpeta que acabas de crear
2. El ID está en la URL de la carpeta:
   ```
   https://drive.google.com/drive/folders/CARPETA_ID_AQUI
   ```
3. Copia el ID que está después de `/folders/`

**Ejemplo en `.env.local`:**
```
GOOGLE_DRIVE_FOLDER_ID=1a2b3c4d5e6f7g8h9i0j
```

**Nota:** Si no especificas `GOOGLE_DRIVE_FOLDER_ID`, los archivos se subirán a la raíz de tu Google Drive.

---

## 📝 Crear el archivo .env.local

Crea un archivo llamado `.env.local` en la raíz de tu proyecto con todas las variables:

```env
# Auth.js
AUTH_SECRET=tu_secreto_generado_con_npx_auth_secret
AUTH_GOOGLE_ID=tu_client_id_de_google
AUTH_GOOGLE_SECRET=tu_client_secret_de_google

# Google Sheets
SPREADSHEET_ID=el_id_de_tu_spreadsheet
GOOGLE_SERVICE_ACCOUNT_EMAIL=tu-service-account@proyecto.iam.gserviceaccount.com
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Google Drive
GOOGLE_DRIVE_FOLDER_ID=el_id_de_tu_carpeta_en_drive
```

---

## ✅ Verificar la Configuración

1. Asegúrate de que el archivo `.env.local` existe en la raíz del proyecto
2. Reinicia tu servidor de desarrollo si está corriendo:
   ```powershell
   npm run dev
   ```
3. Intenta iniciar sesión con Google en tu aplicación
4. Verifica que puedas ver los datos del spreadsheet en la página principal
5. Prueba crear, editar y eliminar items desde el panel de administración
6. Prueba subir una imagen desde el panel de administración (debe guardarse en Google Drive)

---

## 🔒 Seguridad

- **NUNCA** subas el archivo `.env.local` a Git (ya está en `.gitignore`)
- **NUNCA** compartas tus credenciales públicamente
- Mantén el archivo JSON de la cuenta de servicio en un lugar seguro
- Si expones credenciales accidentalmente, revócalas inmediatamente en Google Cloud Console

---

## 🆘 Solución de Problemas

### Error: "Invalid credentials"
- Verifica que copiaste correctamente todas las variables
- Asegúrate de que la clave privada tiene las comillas y los `\n`

### Error: "The caller does not have permission"
- Verifica que compartiste el spreadsheet con el email de la cuenta de servicio
- Verifica que la cuenta de servicio tiene permisos de "Editor"

### Error: "Redirect URI mismatch"
- Verifica que agregaste la URL correcta en "URI de redirección autorizados" en Google Cloud Console
- Para desarrollo local debe ser: `http://localhost:3000/api/auth/callback/google`

### Error: "Access blocked: This app's request is invalid"
- Verifica que la pantalla de consentimiento OAuth está configurada correctamente
- Si estás en modo de prueba, agrega tu email como usuario de prueba

### Error: "GOOGLE_DRIVE_FOLDER_ID no está configurado"
- Verifica que agregaste la variable `GOOGLE_DRIVE_FOLDER_ID` en tu `.env.local`
- Asegúrate de que el ID de la carpeta es correcto

### Error: "Error al subir el archivo a Google Drive"
- Verifica que habilitaste la API de Google Drive en Google Cloud Console
- Verifica que el scope de Google Drive está incluido en la configuración de OAuth (ya está incluido por defecto)
- Asegúrate de que estás autenticado correctamente (el archivo se sube a tu Google Drive personal)
- Verifica que el tamaño del archivo no excede 10MB
- Si especificaste `GOOGLE_DRIVE_FOLDER_ID`, verifica que la carpeta existe y que tienes permisos para escribir en ella

### Error: "Service Accounts do not have storage quota"
- Este error ya no debería aparecer porque ahora usamos OAuth en lugar de Service Account para subir archivos
- Si aún aparece, verifica que estás usando la versión actualizada del código

---

¡Listo! Con estos pasos deberías tener todas las variables configuradas correctamente. 🎉
