# Hotel Booking

## Descripción General

Este proyecto es una aplicación diseñada para gestionar de manera eficiente las operaciones principales de un hotel. Permite administrar reservas, habitaciones, huéspedes y procesos internos desde una plataforma centralizada. 
El sistema busca optimizar el flujo de trabajo del personal, mejorar la experiencia del huésped y proporcionar herramientas de control y seguimiento para una gestión hotelera moderna y flexible.

Componentes del proyecto:
- Backend: API REST en Spring Boot (Java 21).
- Frontend: React.
- Base de datos: MongoDB.

---

## Integrantes del Equipo

| Nombre | Rol | Funcionalidad CRUD desarrollada |
|:----------------------|:------------------|:--------------------------------|
| Giovanny Ojeda    | Backend Developer | CRUD de Productos |
| Alejandro Santamaría | Backend Developer | CRUD de Categorías |
| Diego Fonseca     | Fullstack Developer | CRUD de Usuarios y Login |
| Todos los integrantes | Frontend | Maquetación y consumo de API |

---

## Tecnologías Implementadas

### Backend
- Java 21, Spring Boot 3.5.5  
- Spring Web, Spring Data MongoDB  
- MongoDB 7.0+  
- Lombok  
- Maven  

### Frontend (estático)
- React 18 (componentes funcionales y hooks)
- JavaScript ES6+
- Vite para el entorno de desarrollo
- React Router para la navegación entre vistas
- Axios / Fetch API para la comunicación con el backend
- Tailwind CSS para el diseño y estilos responsivos
- React Icons / Heroicons / Lucide para iconografía
- NPM para la gestión de dependencias
---

## Arquitectura General

```
FireX/
├── backend/               
│   ├── controllers/
│   ├── dto/
│   ├── exception/
|   ├── model/                
│   ├── repositories/       
│   ├── security/
│   ├── service/
│   ├── utils/
│   └── HotelBookingApplication.java
│
└── frontend/                
    ├── css/
    │   └── styles.css
    ├── js/
    │   └── common.js
    ├── admin.html
    ├── carrito.html
    ├── catalogo.html
    ├── index.html
    ├── login.html
    ├── recarga.html
    ├── register.html
    └── solicitudes.html
```

## Diseño de Base de Datos

### Diagrama 
![Diagrama de base de datos](./images/nosql.png)

---

## ⚙️ Funcionalidades de Administración (Backend y Gestión)

Estas herramientas ofrecen un control total sobre las reservas, la tarificación y la asignación de habitaciones al cliente.

---

### 1.  Gestión de Habitaciones (Inventario y Tarifas)

#### **Gestión de Habitaciones (CRUD Ampliado)**
- **Añadir:** Registro completo con detalles, múltiples imágenes y etiquetas para filtros.  
- **Editar:** Modificación de datos con historial de cambios de precios y descripciones.  
- **Inventario en Tiempo Real:** Actualización automática de la disponibilidad tras cada reserva o cancelación.

#### **Gestión Dinámica de Tarifas y Ofertas**
- Definición de precios base y aplicación de tarifas especiales por temporada (alta/baja), festivos o duración de la estancia.  
- Creación y administración de **códigos promocionales** y **descuentos por reserva anticipada**.

---

### 2. Gestión de Reservas y Clientes

#### **Gestión Completa de Reservas**
- **Visualización:** Reservas activas, pendientes, canceladas y archivadas.  
- **Filtros avanzados:** Fecha de estancia, estado de pago, nombre del huésped.  
- **Acciones:** Confirmar, cancelar, modificar fechas o cambiar la habitación.

#### **Módulo CRM Básico**
- Almacena el historial de reservas por cliente y muestra preferencias relevantes.

#### **Lógica de Negocio Avanzada**
- Cálculo automático de la capacidad según número total de huéspedes.  
- Aplicación automática de **tarifas especiales** y **descuentos**.

---

## Backend — Detalle Técnico

### Dependencias principales (pom.xml)
```xml
<dependencies>
		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-data-mongodb</artifactId>
		</dependency>
		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-security</artifactId>
		</dependency>
		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-validation</artifactId>
		</dependency>
		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-web</artifactId>
		</dependency>

		<dependency>
			<groupId>org.projectlombok</groupId>
			<artifactId>lombok</artifactId>
			<optional>true</optional>
		</dependency>
		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-test</artifactId>
			<scope>test</scope>
		</dependency>
		<dependency>
			<groupId>org.springframework.security</groupId>
			<artifactId>spring-security-test</artifactId>
			<scope>test</scope>
		</dependency>
        <!-- https://mvnrepository.com/artifact/io.jsonwebtoken/jjwt-jackson -->
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-jackson</artifactId>
            <version>0.13.0</version>
            <scope>runtime</scope>
        </dependency>
        <!-- https://mvnrepository.com/artifact/io.jsonwebtoken/jjwt-impl -->
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-impl</artifactId>
            <version>0.13.0</version>
            <scope>runtime</scope>
        </dependency>
        <!-- https://mvnrepository.com/artifact/io.jsonwebtoken/jjwt-api -->
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-api</artifactId>
            <version>0.13.0</version>
        </dependency>
        <!-- https://mvnrepository.com/artifact/software.amazon.awssdk/s3 -->
        <dependency>
            <groupId>software.amazon.awssdk</groupId>
            <artifactId>s3</artifactId>
            <version>2.38.7</version>
            <scope>compile</scope>
        </dependency>
	</dependencies>
```

### Controladores REST
- AuthController — Autenticación de usuarios (registro y login)
- BokkingController.java — Reservas de habitaciones  
- RoomController.java — CRUD de habitaciones
- UserController - CRUD de usuarios

### Endpoints Principales

**Usuarios (/api/users)**
| Método | Endpoint | Descripción |
|:--|:--|:--|
| POST | /add | Crear usuario |
| GET | /all | Listar usuarios |
| GET | /get-by-id/{userId} | Obtener usuario por ID |
| DELETE | /delete/{userId} | Eliminar usuario |
| POST | /login | Iniciar sesión |

**bOOKING (/bookings)**
| Método | Endpoint | Descripción |
|:--|:--|:--|
| POST | /book-room/{roomId}/{userId} | Crear habitación |
| GET | /cancel/{bookingId} | Cancelar reservación |

### Configuración de Base de Datos
Editar backend/src/main/resources/application.properties:
```properties
pring.application.name=HotelBooking
server.port = 8090
spring.data.mongodb.uri = mongodb+srv://user:password@clustername.n6D62hB.mongodb.net/db_name
spring.data.mongodb.auto-index-creation = true
```

---



## Galería del Proyecto (Evidencias Frontend)

A continuación se muestran imágenes representativas del funcionamiento del sistema FireX Hub.

### Página de Inicio
![Inicio](./images/inicio.png)

### Login de Usuario
![Login](./images/login.png)

### Catálogo de Productos
![Catálogo](./images/catalogo.png)

### Panel de Administración
![Panel Admin](./images/admin.png)

### CRUD de Productos
![CRUD Productos](./images/crud_productos.png)

### CRUD de Categorías
![CRUD Categorías](./images/crud_categoria.png)

### CRUD de Usuarios
![CRUD Categorías](./images/crud_usuarios.png)

---

## Ejecución del Proyecto

### 1. Clonar el repositorio
```bash
git clone https://github.com/<usuario>/firex.git
cd firex
```

### 2. Iniciar el Backend
```bash
cd backend
mvn clean install
mvn spring-boot:run
```
Disponible en http://localhost:8066

### 3. Servir el Frontend
```bash
cd frontend
python -m http.server 5173
```
Navegar a http://localhost:5173

---

## Pruebas

Backend:
```bash
mvn test
```

---

## Documentación de la API
Swagger UI:  
http://localhost:8066/swagger-ui/index.html

---




