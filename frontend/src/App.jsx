import React, { useState, createContext, useContext, useEffect, useRef } from 'react';
import { Search, Home, Menu, X, Check, Trash2 } from 'lucide-react';
import './index.css';
import './App.css';

// fallback local image (la que subiste)
const LOCAL_PLACEHOLDER = '/mnt/data/21a1a7f2-0474-42eb-8a98-4b45d5ca6c99.png';

// MOCKS iniciales (sin cambios importantes)
const MOCK_ROOMS = [
  { id: '1', roomType: 'Habitación Deluxe', roomPrice: 150, roomPhotoUrl: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1200', roomDescription: 'Amplia habitación con vista al mar, cama king size y baño privado.' },
  { id: '2', roomType: 'Suite Presidencial', roomPrice: 350, roomPhotoUrl: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1200', roomDescription: 'Suite de lujo con sala de estar, jacuzzi y terraza privada.' },
  { id: '3', roomType: 'Habitación Estándar', roomPrice: 80, roomPhotoUrl: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=1200', roomDescription: 'Habitación cómoda y funcional, perfecta para viajeros de negocio.' },
  { id: '4', roomType: 'Habitación Familiar', roomPrice: 200, roomPhotoUrl: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=1200', roomDescription: 'Espaciosa habitación con dos camas queen y área de juegos para niños.' },
  { id: '5', roomType: 'Suite Romántica', roomPrice: 250, roomPhotoUrl: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200', roomDescription: 'Ambiente íntimo con decoración elegante, ideal para parejas.' },
  { id: '6', roomType: 'Habitación Ejecutiva', roomPrice: 180, roomPhotoUrl: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=1200', roomDescription: 'Incluye escritorio amplio, WiFi de alta velocidad y minibar.' }
];
const MOCK_ROOM_TYPES = ['Habitación Deluxe', 'Suite Presidencial', 'Habitación Estándar', 'Habitación Familiar', 'Suite Romántica', 'Habitación Ejecutiva'];
const MOCK_USER = { id: 'user123', name: 'Juan Pérez', email: 'juan@example.com', role: 'USER' };

// ---------- AUTH CONTEXT ----------
const AuthContext = createContext(null);
const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser && token) setUser(JSON.parse(storedUser));
    setLoading(false);
  }, [token]);

  const login = (userData, authToken) => {
    setUser(userData); setToken(authToken);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', authToken);
  };
  const logout = () => {
    setUser(null); setToken(null);
    localStorage.removeItem('user'); localStorage.removeItem('token');
  };

  return <AuthContext.Provider value={{ user, token, login, logout, loading }}>{children}</AuthContext.Provider>;
};
const useAuth = () => useContext(AuthContext);

// ---------- API MOCK (ahora persiste reservas en localStorage) ----------
const apiService = {
  register: async (userData) => { await new Promise(r => setTimeout(r, 500)); return { statusCode: 200, user: { ...userData, id: 'user' + Date.now() } }; },
  login: async (credentials) => { await new Promise(r => setTimeout(r, 400)); return { statusCode: 200, user: MOCK_USER, token: 'mock-jwt-token-' + Date.now() }; },
  getAllRooms: async () => { await new Promise(r => setTimeout(r, 300)); return { statusCode: 200, roomList: MOCK_ROOMS }; },
  getRoomTypes: async () => { await new Promise(r => setTimeout(r, 200)); return MOCK_ROOM_TYPES; },
  // Filtra por tipo para demo
  getAvailableRooms: async (checkInDate, checkOutDate, roomType) => {
    await new Promise(r => setTimeout(r, 300));
    const filteredRooms = MOCK_ROOMS.filter(room => room.roomType === roomType);
    return { statusCode: 200, roomList: filteredRooms.length ? filteredRooms : MOCK_ROOMS };
  },
  // createBooking ahora guarda la reserva en localStorage bajo la clave 'bookings'
  createBooking: async (roomId, userId, bookingData, token) => {
    await new Promise(r => setTimeout(r, 400));
    const confirmation = 'BOOK-' + Math.random().toString(36).substring(2, 10).toUpperCase();
    const booking = {
      id: confirmation,
      roomId,
      userId,
      bookingData,
      createdAt: new Date().toISOString()
    };

    // persistir en localStorage (arreglo por usuario)
    try {
      const raw = localStorage.getItem('bookings');
      const arr = raw ? JSON.parse(raw) : [];
      arr.push(booking);
      localStorage.setItem('bookings', JSON.stringify(arr));
    } catch (err) {
      console.warn('No se pudo persistir reserva localmente', err);
    }

    return { statusCode: 200, message: 'Reserva creada exitosamente', bookingConfirmationCode: confirmation };
  },

  // obtener reservas del usuario
  getUserBookings: async (userId) => {
    await new Promise(r => setTimeout(r, 150));
    try {
      const raw = localStorage.getItem('bookings');
      const arr = raw ? JSON.parse(raw) : [];
      return arr.filter(b => b.userId === userId);
    } catch (err) {
      return [];
    }
  },

  // cancelar reserva (borrado local)
  cancelBooking: async (bookingId) => {
    await new Promise(r => setTimeout(r, 150));
    try {
      const raw = localStorage.getItem('bookings');
      const arr = raw ? JSON.parse(raw) : [];
      const next = arr.filter(b => b.id !== bookingId);
      localStorage.setItem('bookings', JSON.stringify(next));
      return { statusCode: 200 };
    } catch (err) {
      return { statusCode: 500 };
    }
  }
};

// ---------- COMPONENTES ----------
const Header = ({ onToggleReservations }) => {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="topbar">
      <div className="topbar-inner">
        <div className="brand">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Home size={34} />
            <div>
              <div className="title">Hotel Booking</div>
              <div className="subtitle">Buscar Habitaciones Disponibles</div>
            </div>
          </div>
        </div>

        <nav className="nav">
          <a className="nav-item" href="#">Inicio</a>
          {/* ahora "Reservas" invoca la función que abre el panel */}
          <button type="button" onClick={onToggleReservations} className="nav-item nav-ghost" style={{cursor:'pointer'}}>Reservas</button>
          {user ? (
            <>
              <span className="nav-item">Hola, {user.name}</span>
              <span className="role-pill">{user.role}</span>
              <button onClick={logout} className="nav-item" style={{ background: 'rgba(255,235,238,0.9)', color: '#b91c1c' }}>Cerrar Sesión</button>
            </>
          ) : (
            <a className="nav-item" href="#">Iniciar</a>
          )}
        </nav>

        <button className="menu-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Abrir menú">
          {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="mobile-menu-panel">
          <div className="menu-row">
            <Home size={20} />
            <div>
              <div style={{ fontWeight: 700 }}>{user ? user.name : 'Invitado'}</div>
              <div style={{ fontSize: 12, color: '#6b7280' }}>{user ? user.email : ''}</div>
            </div>
          </div>
          <div className="menu-row"><a className="mobile-menu-link" href="#">Inicio</a></div>
          <div className="menu-row"><button className="mobile-menu-link" onClick={onToggleReservations}>Reservas</button></div>
          <div className="menu-row">
            {user ? (<button onClick={logout} className="mobile-menu-link" style={{ textAlign: 'left', color: '#b91c1c' }}>Cerrar sesión</button>) : (<a className="mobile-menu-link" href="#">Iniciar sesión</a>)}
          </div>
        </div>
      )}
    </header>
  );
};

// Modal de reserva: sin cambios funcionales, solo centrado por CSS
const BookingModal = ({ room, onClose, onConfirm }) => {
  const [bookingData, setBookingData] = useState({
    checkInDate: '',
    checkOutDate: '',
    numOfAdults: 1,
    numOfChildren: 0
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!bookingData.checkInDate || !bookingData.checkOutDate) return alert('Selecciona fechas');
    if (bookingData.checkOutDate <= bookingData.checkInDate) return alert('La fecha de check-out debe ser posterior al check-in');
    onConfirm(bookingData);
  };

  return (
    <div className="modal-backdrop">
      <div className="auth-card modal-card">
        <h2 className="title" style={{ fontSize: '1.05rem' }}>Reservar: {room.roomType}</h2>
        <form onSubmit={handleSubmit} className="space-y-3" style={{ marginTop: 10 }}>
          <div>
            <label className="muted">Check-in</label>
            <input className="input" type="date" value={bookingData.checkInDate} onChange={(e) => setBookingData({ ...bookingData, checkInDate: e.target.value })} required />
          </div>
          <div>
            <label className="muted">Check-out</label>
            <input className="input" type="date" value={bookingData.checkOutDate} onChange={(e) => setBookingData({ ...bookingData, checkOutDate: e.target.value })} required />
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <input className="input" type="number" min="1" value={bookingData.numOfAdults} onChange={(e) => setBookingData({ ...bookingData, numOfAdults: parseInt(e.target.value || 1) })} />
            <input className="input" type="number" min="0" value={bookingData.numOfChildren} onChange={(e) => setBookingData({ ...bookingData, numOfChildren: parseInt(e.target.value || 0) })} />
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button type="button" onClick={onClose} className="btn-ghost">Cancelar</button>
            <button type="submit" className="btn-primary">Confirmar</button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Componente que muestra la lista de reservas del usuario
const ReservationsPanel = ({ open, onClose, userId, onCancelBooking }) => {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    if (!open) return;
    (async () => {
      const res = await apiService.getUserBookings(userId);
      setBookings(res || []);
    })();
  }, [open, userId]);

  if (!open) return null;

  return (
    <div className="drawer-backdrop" role="dialog" aria-modal="true">
      <aside className="drawer-panel">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <h3 style={{ margin: 0 }}>Mis Reservas</h3>
          <button className="btn-icon" onClick={onClose}><X /></button>
        </div>

        {bookings.length === 0 && <div className="muted">No tienes reservas todavía.</div>}

        <div style={{ display: 'grid', gap: 12, marginTop: 8 }}>
          {bookings.map(b => {
            const room = MOCK_ROOMS.find(r => r.id === b.roomId) || {};
            return (
              <div key={b.id} style={{ background: '#fff', padding: 12, borderRadius: 10, boxShadow: '0 8px 20px rgba(2,6,23,0.04)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontWeight: 700 }}>{room.roomType || 'Habitación'}</div>
                    <div className="muted" style={{ fontSize: 13 }}>{new Date(b.createdAt).toLocaleString()}</div>
                    <div style={{ marginTop: 8, color: '#374151' }}>
                      <div>Check-in: <strong>{b.bookingData.checkInDate}</strong></div>
                      <div>Check-out: <strong>{b.bookingData.checkOutDate}</strong></div>
                      <div>Adultos: {b.bookingData.numOfAdults} • Niños: {b.bookingData.numOfChildren}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ fontWeight: 700, color: '#065f46' }}>{b.id}</div>
                    <button className="btn-ghost" onClick={async () => { await apiService.cancelBooking(b.id); onCancelBooking(); }}>
                      <Trash2 /> Cancelar
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </aside>
    </div>
  );
};

const RoomCard = ({ room, onBook }) => (
  <article className="room-card" aria-label={room.roomType}>
    <div className="room-img" style={{ backgroundImage: `url(${room.roomPhotoUrl || LOCAL_PLACEHOLDER})` }} aria-hidden="true" />
    <div className="room-overlay">
      <div>
        <div className="room-title">{room.roomType}</div>
        <div className="room-desc">{room.roomDescription}</div>
      </div>
      <div className="room-footer">
        <span style={{ fontWeight: 700 }}>${room.roomPrice} <span style={{ fontSize: '0.9rem', opacity: 0.9 }}>/noche</span></span>
        <button className="btn-primary" onClick={() => onBook(room)}>Reservar</button>
      </div>
    </div>
  </article>
);

const HomePage = () => {
  const { user } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [bookingSuccess, setBookingSuccess] = useState(null);

  // estado para mostrar panel de reservas
  const [showReservations, setShowReservations] = useState(false);

  useEffect(() => {
    (async () => {
      const res = await apiService.getAllRooms();
      if (res.statusCode === 200) setRooms(res.roomList || []);
      setLoading(false);
    })();
  }, []);

  const handleSearch = async (params) => {
    setLoading(true);
    const res = await apiService.getAvailableRooms(params.checkInDate, params.checkOutDate, params.roomType);
    if (res.statusCode === 200) setRooms(res.roomList || []);
    setLoading(false);
  };

  const handleBookingConfirm = async (bookingData) => {
    // user.id existe porque HomePage solo se muestra si user autenticado (en esta demo)
    const res = await apiService.createBooking(selectedRoom.id, user.id, bookingData);
    if (res.statusCode === 200) {
      setBookingSuccess(res.bookingConfirmationCode);
      setSelectedRoom(null);
      // opcional: abrir panel de reservas después de reservar
      setShowReservations(true);
    } else {
      alert('Error al crear la reserva');
    }
  };

  const refreshReservations = () => {
    // fuerza re-render del panel llamando a su effect (toggle)
    setShowReservations(false);
    setTimeout(() => setShowReservations(true), 120);
  };

  if (loading) return <div className="loading-wrap"><div className="spinner" /></div>;

  return (
    <div className="page-bg">
      {/* pasamos la función para abrir/ocultar panel de reservas */}
      <Header onToggleReservations={() => setShowReservations(s => !s)} />

      <main className="container" style={{ paddingTop: 16 }}>
        {bookingSuccess && (
          <div className="alert-success">
            <Check /> <div style={{ marginLeft: 8 }}><strong>¡Reserva exitosa!</strong><div>Código: <strong>{bookingSuccess}</strong></div></div>
          </div>
        )}

        <div style={{ marginBottom: 18 }}>
          <RoomSearch onSearch={handleSearch} />
        </div>

        <section className="rooms-fullwidth">
          <div className="room-grid">
            {rooms.map(r => <RoomCard key={r.id} room={r} onBook={setSelectedRoom} />)}
          </div>
        </section>
      </main>

      {selectedRoom && <BookingModal room={selectedRoom} onClose={() => setSelectedRoom(null)} onConfirm={handleBookingConfirm} />}

      {/* Panel de reservas */}
      <ReservationsPanel
        open={showReservations}
        onClose={() => setShowReservations(false)}
        userId={user?.id}
        onCancelBooking={refreshReservations}
      />
    </div>
  );
};

// Pequeño componente RoomSearch separado (sin cambios)
const RoomSearch = ({ onSearch }) => {
  const [searchParams, setSearchParams] = useState({ checkInDate: '', checkOutDate: '', roomType: '' });
  const [roomTypes, setRoomTypes] = useState([]);

  useEffect(() => { (async () => { const t = await apiService.getRoomTypes(); setRoomTypes(t); })(); }, []);

  const handleSearch = (e) => { e?.preventDefault?.(); onSearch(searchParams); };

  return (
    <div className="search-card container">
      <h3 className="search-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Search /> Buscar Habitaciones Disponibles</h3>
      <form className="search-row" onSubmit={handleSearch} style={{ marginTop: 12 }}>
        <div className="col">
          <label className="muted">Check-in</label>
          <input type="date" className="input" value={searchParams.checkInDate} onChange={e => setSearchParams({ ...searchParams, checkInDate: e.target.value })} required />
        </div>
        <div className="col">
          <label className="muted">Check-out</label>
          <input type="date" className="input" value={searchParams.checkOutDate} onChange={e => setSearchParams({ ...searchParams, checkOutDate: e.target.value })} required />
        </div>
        <div className="col">
          <label className="muted">Tipo de Habitación</label>
          <select className="input" value={searchParams.roomType} onChange={e => setSearchParams({ ...searchParams, roomType: e.target.value })} required>
            <option value="">Seleccionar...</option>
            {roomTypes.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div className="col" style={{ display: 'flex', alignItems: 'flex-end' }}>
          <button className="btn-search" type="submit">Buscar</button>
        </div>
      </form>
    </div>
  );
};

// App principal
const App = () => (
  <AuthProvider>
    <MainApp />
  </AuthProvider>
);

const MainApp = () => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-wrap"><div className="spinner" /></div>;
  // Nota: en este demo, si user no está logueado, mostramos AuthPage
  return user ? <HomePage /> : <AuthPage />;
};

// AuthPage: **se eliminó** el texto "Modo Demo" que pediste quitar.
const AuthPage = () => {
  const { login } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '', name: '', phoneNumber: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        const response = await apiService.login();
        if (response.statusCode === 200) login(response.user, response.token);
      } else {
        await apiService.register(formData);
        setIsLogin(true);
        alert('Registro exitoso. Por favor inicia sesión.');
      }
    } catch (err) {
      alert('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="logo"><Home /></div>
        <h2 className="title" style={{ marginTop: 12 }}>{isLogin ? 'Iniciar Sesión' : 'Registrarse'}</h2>

        <form className="form" onSubmit={handleSubmit}>
          {!isLogin && <>
            <div className="form-group"><input className="input" placeholder="Nombre completo" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required /></div>
            <div className="form-group"><input className="input" placeholder="Teléfono" value={formData.phoneNumber} onChange={e => setFormData({ ...formData, phoneNumber: e.target.value })} /></div>
          </>}
          <div className="form-group"><input className="input" type="email" placeholder="Email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} required /></div>
          <div className="form-group"><input className="input" type="password" placeholder="Contraseña" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} required /></div>
          <button className="btn-primary" type="submit" disabled={loading}>{loading ? 'Cargando...' : (isLogin ? 'Iniciar Sesión' : 'Registrarse')}</button>
        </form>

        <button className="small-link" onClick={() => setIsLogin(!isLogin)}>{isLogin ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}</button>
      </div>
    </div>
  );
};

export default App;
