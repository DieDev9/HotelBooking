import React, { useState, createContext, useContext, useEffect } from 'react';
import { Search, Calendar, Users, LogOut, User, Home, BookOpen, Settings, Menu, X, Check } from 'lucide-react';

// ============================================
// 1. CONFIGURACIÓN Y CONSTANTES
// ============================================
const API_BASE_URL = 'http://localhost:8080';

// ============================================
// 2. AUTH CONTEXT
// ============================================
const AuthContext = createContext(null);

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, [token]);

  const login = (userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', authToken);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  const isAdmin = () => user?.role === 'ADMIN';

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAdmin, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => useContext(AuthContext);

// ============================================
// 3. API SERVICE
// ============================================
const apiService = {
  // Auth
  register: async (userData) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    return response.json();
  },

  login: async (credentials) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    return response.json();
  },

  // Rooms
  getAllRooms: async () => {
    const response = await fetch(`${API_BASE_URL}/rooms/all`);
    return response.json();
  },

  getRoomById: async (roomId) => {
    const response = await fetch(`${API_BASE_URL}/rooms/room-by-id/${roomId}`);
    return response.json();
  },

  getRoomTypes: async () => {
    const response = await fetch(`${API_BASE_URL}/rooms/types`);
    return response.json();
  },

  getAvailableRooms: async (checkInDate, checkOutDate, roomType) => {
    const params = new URLSearchParams({
      checkInDate,
      checkOutDate,
      roomType
    });
    const response = await fetch(`${API_BASE_URL}/rooms/available-rooms-by-date-and-type?${params}`);
    return response.json();
  },

  addRoom: async (roomData, token) => {
    const params = new URLSearchParams(roomData);
    const response = await fetch(`${API_BASE_URL}/rooms/add?${params}`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  },

  updateRoom: async (roomId, roomData, token) => {
    const params = new URLSearchParams(roomData);
    const response = await fetch(`${API_BASE_URL}/rooms/update/${roomId}?${params}`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  },

  deleteRoom: async (roomId, token) => {
    const response = await fetch(`${API_BASE_URL}/rooms/delete/${roomId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  },

  // Bookings
  createBooking: async (roomId, userId, bookingData, token) => {
    const response = await fetch(`${API_BASE_URL}/bookings/book-room/${roomId}/${userId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(bookingData)
    });
    return response.json();
  },

  getAllBookings: async (token) => {
    const response = await fetch(`${API_BASE_URL}/bookings/all`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  },

  getBookingByConfirmation: async (confirmationCode) => {
    const response = await fetch(`${API_BASE_URL}/bookings/get-by-confirmation-code/${confirmationCode}`);
    return response.json();
  },

  cancelBooking: async (bookingId, token) => {
    const response = await fetch(`${API_BASE_URL}/bookings/cancel/${bookingId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  },

  // Users
  getUserProfile: async (token) => {
    const response = await fetch(`${API_BASE_URL}/users/get-logged-in-profile-info`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  },

  getUserBookings: async (userId, token) => {
    const response = await fetch(`${API_BASE_URL}/users/get-user-bookings/${userId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  }
};

// ============================================
// 4. COMPONENTES COMUNES
// ============================================
const Header = () => {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-2">
            <Home className="text-blue-600" size={28} />
            <h1 className="text-2xl font-bold text-gray-800">Hotel Booking</h1>
          </div>

          <nav className="hidden md:flex items-center space-x-6">
            {user && (
              <>
                <span className="text-gray-600">Hola, {user.name || user.email}</span>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  {user.role}
                </span>
                <button
                  onClick={logout}
                  className="flex items-center space-x-2 text-red-600 hover:text-red-800"
                >
                  <LogOut size={20} />
                  <span>Cerrar Sesión</span>
                </button>
              </>
            )}
          </nav>

          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {mobileMenuOpen && user && (
          <div className="md:hidden pb-4 space-y-2">
            <div className="text-gray-600">{user.name || user.email}</div>
            <div className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm inline-block">
              {user.role}
            </div>
            <button
              onClick={logout}
              className="flex items-center space-x-2 text-red-600 w-full"
            >
              <LogOut size={20} />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

const Loading = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
  </div>
);

// ============================================
// 5. PÁGINA DE LOGIN/REGISTER
// ============================================
const AuthPage = () => {
  const { login } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    phoneNumber: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        const response = await apiService.login({
          email: formData.email,
          password: formData.password
        });

        if (response.statusCode === 200) {
          login(response.user, response.token);
        } else {
          setError(response.message || 'Error al iniciar sesión');
        }
      } else {
        const response = await apiService.register({
          email: formData.email,
          password: formData.password,
          name: formData.name,
          phoneNumber: formData.phoneNumber,
          role: 'USER'
        });

        if (response.statusCode === 200) {
          setIsLogin(true);
          setError('');
          alert('Registro exitoso. Por favor inicia sesión.');
        } else {
          setError(response.message || 'Error al registrarse');
        }
      }
    } catch (err) {
      setError('Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <Home className="mx-auto text-blue-600 mb-4" size={48} />
          <h2 className="text-3xl font-bold text-gray-800">
            {isLogin ? 'Iniciar Sesión' : 'Registrarse'}
          </h2>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <>
              <input
                type="text"
                placeholder="Nombre completo"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
              <input
                type="tel"
                placeholder="Teléfono"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
              />
            </>
          )}

          <input
            type="email"
            placeholder="Email"
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />

          <input
            type="password"
            placeholder="Contraseña"
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? 'Cargando...' : isLogin ? 'Iniciar Sesión' : 'Registrarse'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-blue-600 hover:underline"
          >
            {isLogin ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================
// 6. BÚSQUEDA DE HABITACIONES
// ============================================
const RoomSearch = ({ onSearch }) => {
  const [searchParams, setSearchParams] = useState({
    checkInDate: '',
    checkOutDate: '',
    roomType: ''
  });
  const [roomTypes, setRoomTypes] = useState([]);

  useEffect(() => {
    const fetchRoomTypes = async () => {
      try {
        const types = await apiService.getRoomTypes();
        setRoomTypes(types);
      } catch (err) {
        console.error('Error fetching room types:', err);
      }
    };
    fetchRoomTypes();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    onSearch(searchParams);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <h2 className="text-2xl font-bold mb-4 flex items-center">
        <Search className="mr-2" />
        Buscar Habitaciones Disponibles
      </h2>
      <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Check-in</label>
          <input
            type="date"
            className="w-full px-4 py-2 border rounded-lg"
            value={searchParams.checkInDate}
            onChange={(e) => setSearchParams({ ...searchParams, checkInDate: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Check-out</label>
          <input
            type="date"
            className="w-full px-4 py-2 border rounded-lg"
            value={searchParams.checkOutDate}
            onChange={(e) => setSearchParams({ ...searchParams, checkOutDate: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Tipo de Habitación</label>
          <select
            className="w-full px-4 py-2 border rounded-lg"
            value={searchParams.roomType}
            onChange={(e) => setSearchParams({ ...searchParams, roomType: e.target.value })}
            required
          >
            <option value="">Seleccionar...</option>
            {roomTypes.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
        <div className="flex items-end">
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
          >
            Buscar
          </button>
        </div>
      </form>
    </div>
  );
};

// ============================================
// 7. TARJETA DE HABITACIÓN
// ============================================
const RoomCard = ({ room, onBook }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
      <img
        src={room.roomPhotoUrl || 'https://via.placeholder.com/400x300'}
        alt={room.roomType}
        className="w-full h-48 object-cover"
      />
      <div className="p-6">
        <h3 className="text-xl font-bold mb-2">{room.roomType}</h3>
        <p className="text-gray-600 mb-4">{room.roomDescription}</p>
        <div className="flex justify-between items-center">
          <span className="text-2xl font-bold text-blue-600">
            ${room.roomPrice}
            <span className="text-sm text-gray-500">/noche</span>
          </span>
          <button
            onClick={() => onBook(room)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Reservar
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================
// 8. FORMULARIO DE RESERVA
// ============================================
const BookingModal = ({ room, onClose, onConfirm }) => {
  const [bookingData, setBookingData] = useState({
    checkInDate: '',
    checkOutDate: '',
    numOfAdults: 1,
    numOfChildren: 0
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm(bookingData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4">Reservar: {room.roomType}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Check-in</label>
            <input
              type="date"
              className="w-full px-4 py-2 border rounded-lg"
              value={bookingData.checkInDate}
              onChange={(e) => setBookingData({ ...bookingData, checkInDate: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Check-out</label>
            <input
              type="date"
              className="w-full px-4 py-2 border rounded-lg"
              value={bookingData.checkOutDate}
              onChange={(e) => setBookingData({ ...bookingData, checkOutDate: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Adultos</label>
            <input
              type="number"
              min="1"
              className="w-full px-4 py-2 border rounded-lg"
              value={bookingData.numOfAdults}
              onChange={(e) => setBookingData({ ...bookingData, numOfAdults: parseInt(e.target.value) })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Niños</label>
            <input
              type="number"
              min="0"
              className="w-full px-4 py-2 border rounded-lg"
              value={bookingData.numOfChildren}
              onChange={(e) => setBookingData({ ...bookingData, numOfChildren: parseInt(e.target.value) })}
              required
            />
          </div>
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-300 text-gray-800 py-2 rounded-lg hover:bg-gray-400"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
            >
              Confirmar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ============================================
// 9. PÁGINA PRINCIPAL
// ============================================
const HomePage = () => {
  const { user, token } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [filteredRooms, setFilteredRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [bookingSuccess, setBookingSuccess] = useState(null);

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const response = await apiService.getAllRooms();
      if (response.statusCode === 200) {
        setRooms(response.roomList || []);
        setFilteredRooms(response.roomList || []);
      }
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (searchParams) => {
    setLoading(true);
    try {
      const response = await apiService.getAvailableRooms(
        searchParams.checkInDate,
        searchParams.checkOutDate,
        searchParams.roomType
      );
      if (response.statusCode === 200) {
        setFilteredRooms(response.roomList || []);
      }
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = async (bookingData) => {
    try {
      const response = await apiService.createBooking(
        selectedRoom.id,
        user.id,
        bookingData,
        token
      );
      
      if (response.statusCode === 200) {
        setBookingSuccess(response.bookingConfirmationCode);
        setSelectedRoom(null);
      } else {
        alert(response.message || 'Error al crear la reserva');
      }
    } catch (err) {
      alert('Error de conexión');
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {bookingSuccess && (
          <div className="mb-8 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg flex items-center">
            <Check className="mr-2" />
            <div>
              <strong>¡Reserva exitosa!</strong>
              <p>Código de confirmación: <strong>{bookingSuccess}</strong></p>
            </div>
            <button
              onClick={() => setBookingSuccess(null)}
              className="ml-auto text-green-700"
            >
              <X />
            </button>
          </div>
        )}

        <RoomSearch onSearch={handleSearch} />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRooms.map((room) => (
            <RoomCard
              key={room.id}
              room={room}
              onBook={setSelectedRoom}
            />
          ))}
        </div>

        {filteredRooms.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No se encontraron habitaciones disponibles</p>
          </div>
        )}
      </div>

      {selectedRoom && (
        <BookingModal
          room={selectedRoom}
          onClose={() => setSelectedRoom(null)}
          onConfirm={handleBooking}
        />
      )}
    </div>
  );
};

// ============================================
// 10. APP PRINCIPAL
// ============================================
const App = () => {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
};

const MainApp = () => {
  const { user, loading } = useAuth();

  if (loading) return <Loading />;

  return user ? <HomePage /> : <AuthPage />;
};

export default App;