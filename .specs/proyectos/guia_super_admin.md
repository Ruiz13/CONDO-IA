# Guía de Operación: Súper Administrador (Dueño del Sistema)

Bienvenido al panel general de **Súper Administrador**. Este panel está destinado exclusivamente a la empresa proveedora del software de Condo IA o al ingeniero de mantenimiento a cargo de administrar el SaaS (Software as a Service) a nivel macro.

---

## 1. Acceso y Entorno
El panel de Súper Administrador suele estar alojado bajo un subdominio o ruta especial (ej: `/super-admin` o `admin.condo-ia.com`). 
1. Accede con las credenciales maestras (Master Admin).
2. Debes tener extremo cuidado con las acciones en este panel, ya que afectan el funcionamiento global de todos los condominios afiliados.

## 2. Gestión de Condominios (Tenants)
Un "Tenant" es un condominio cliente (por ejemplo, "Residencias Imola").
1. Ve a la sección de **Condominios (Tenants)**.
2. Aquí verás una lista de todos los condominios registrados en la plataforma.
3. **Crear nuevo condominio:**
   - Para afiliar una nueva residencia, haz clic en "Agregar Tenant".
   - Rellena el nombre (ej. "Edificio Los Sauces"), RIF y dirección principal.
   - Sube el logotipo del condominio. (Este logo aparecerá en su aplicación móvil y en sus PDFs).
4. **Suspender servicio:** Si un condominio no renueva su suscripción o rompe las normas de servicio, puedes desactivarlo desde este panel. Esto suspenderá su acceso al dashboard y bloqueará a sus residentes en la app móvil.

## 3. Asignación de Administradores Locales
1. Una vez creado el condominio, debes asignarle al menos un usuario administrador.
2. Ve a la lista de **Usuarios** del Tenant específico y crea una cuenta con el rol `ADMIN`.
3. Estas son las credenciales que entregarás a la Junta de Condominio respectiva para que ellos empiecen a cargar su información local.

## 4. Configuración Global del Sistema
Desde la sección de **Configuraciones Globales**:
- **Credenciales de Correo Electrónico:** Parámetros SMTP (SendGrid, AWS SES, Ethereal) que utilizará el servidor para emitir notificaciones y facturas a miles de usuarios.
- **Configuración de IA (LLM):** Llaves de API (API Keys) como las de Google Gemini / OpenAI utilizadas para responder el chat. Aquí puedes gestionar los límites de uso por condominio para no exceder los costos de la API.
- **Almacenamiento (Cloud Storage):** Parámetros de conexión a los buckets (Firebase Storage, AWS S3) donde se guardan los recibos de pago subidos por todos los residentes.

## 5. Auditoría y Trazabilidad (Logs)
1. Ve a la sección de **Auditoría**.
2. Podrás ver un registro en tiempo real de todas las acciones que se realizan a nivel de base de datos (Ej: Quién borró un inmueble, cuándo se eliminó un gasto, etc.).
3. Es útil para brindar soporte técnico de Nivel 2 o Nivel 3 si una Junta de Condominio borra algo por error y solicita ayuda para recuperarlo.
