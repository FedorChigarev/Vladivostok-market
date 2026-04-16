import { useEffect, useState } from 'react';
import ListingCard from './ListingCard';
import { supabase } from './supabase';
import {
  getMaxUser,
  getMaxStartParam,
  getMaxPlatform,
  getMaxVersion,
  getMaxInitData,
} from './max';

function App() {
  const [filter, setFilter] = useState('Все');
  const [search, setSearch] = useState('');
  const [listings, setListings] = useState([]);
  const [selectedListing, setSelectedListing] = useState(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('Электроника');
  const [contacts, setContacts] = useState('');
  const [imageFile, setImageFile] = useState(null);

  const [isModerator, setIsModerator] = useState(false);
  const [showModeratorLogin, setShowModeratorLogin] = useState(false);
  const [moderatorPassword, setModeratorPassword] = useState('');

  const [user, setUser] = useState(null);
  const [showAuthBox, setShowAuthBox] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [maxUser, setMaxUser] = useState(null);
  const [maxStartParam, setMaxStartParam] = useState(null);
  const [maxPlatform, setMaxPlatform] = useState(null);
  const [maxVersion, setMaxVersion] = useState(null);

  const API_URL = 'https://vladivostok-market-server.onrender.com';

  const loadListings = () => {
    fetch(`${API_URL}/listings`)
      .then((res) => res.json())
      .then((data) => setListings(data))
      .catch((err) => {
        console.error('Ошибка загрузки объявлений:', err);
      });
  };

  useEffect(() => {
    loadListings();
  }, []);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user || null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const userFromMax = getMaxUser();
    const startParam = getMaxStartParam();
    const platform = getMaxPlatform();
    const version = getMaxVersion();

    setMaxUser(userFromMax);
    setMaxStartParam(startParam);
    setMaxPlatform(platform);
    setMaxVersion(version);

    console.log('MAX initData:', getMaxInitData());
    console.log('MAX user:', userFromMax);
    console.log('MAX start_param:', startParam);
    console.log('MAX platform:', platform);
    console.log('MAX version:', version);
  }, []);

  const openListing = (id) => {
    fetch(`${API_URL}/listings/${id}`)
      .then((res) => res.json())
      .then((data) => setSelectedListing(data))
      .catch((err) => {
        console.error('Ошибка загрузки карточки:', err);
      });
  };

  const closeListing = () => {
    setSelectedListing(null);
  };

  const signUp = async () => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      alert(error.message);
      return;
    }

    alert('Регистрация прошла. Если включено подтверждение email, проверь почту.');
    setEmail('');
    setPassword('');
    setShowAuthBox(false);
  };

  const signIn = async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert(error.message);
      return;
    }

    alert('Вы вошли');
    setEmail('');
    setPassword('');
    setShowAuthBox(false);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    alert('Вы вышли');
  };

  const addListing = () => {
    if (!user) {
      alert('Только зарегистрированный пользователь может публиковать объявление');
      return;
    }

    if (!title || !price) {
      alert('Заполни хотя бы название и цену');
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('price', price);
    formData.append('category', category);
    formData.append('contacts', contacts);

    if (imageFile) {
      formData.append('image', imageFile);
    }

    fetch(`${API_URL}/listings`, {
      method: 'POST',
      body: formData,
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          alert(data.error);
          return;
        }

        setTitle('');
        setDescription('');
        setPrice('');
        setCategory('Электроника');
        setContacts('');
        setImageFile(null);
        loadListings();
      })
      .catch((err) => {
        console.error('Ошибка добавления:', err);
      });
  };

  const deleteListing = (id) => {
    fetch(`${API_URL}/listings/${id}`, {
      method: 'DELETE',
      headers: {
        'x-moderator-password': moderatorPassword,
      },
    })
      .then(async (res) => {
        const data = await res.json();

        if (!res.ok) {
          alert(data.error || 'Ошибка удаления');
          return;
        }

        if (selectedListing && selectedListing.id === id) {
          setSelectedListing(null);
        }

        loadListings();
      })
      .catch((err) => {
        console.error('Ошибка удаления:', err);
      });
  };

  const loginAsModerator = () => {
    if (!moderatorPassword) {
      alert('Введите пароль');
      return;
    }

    setIsModerator(true);
    setShowModeratorLogin(false);
    alert('Режим модератора включён');
  };

  const logoutModerator = () => {
    setIsModerator(false);
    setModeratorPassword('');
    alert('Режим модератора выключен');
  };

  if (selectedListing) {
    return (
      <div className="page">
        <div className="topbar">
          <button onClick={closeListing}>← Назад</button>

          <div className="topbar-actions">
            {!user ? (
              <button onClick={() => setShowAuthBox(true)}>Войти / Регистрация</button>
            ) : (
              <button onClick={signOut}>Выйти ({user.email})</button>
            )}

            {!isModerator ? (
              <button onClick={() => setShowModeratorLogin(true)}>
                Войти как модератор
              </button>
            ) : (
              <button onClick={logoutModerator}>
                Выйти из режима модератора
              </button>
            )}
          </div>
        </div>

        {showAuthBox && (
          <div className="moderator-box">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              placeholder="Пароль"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button onClick={authMode === 'login' ? signIn : signUp}>
              {authMode === 'login' ? 'Войти' : 'Зарегистрироваться'}
            </button>
            <button
              onClick={() =>
                setAuthMode(authMode === 'login' ? 'signup' : 'login')
              }
            >
              {authMode === 'login' ? 'Нужна регистрация' : 'У меня уже есть аккаунт'}
            </button>
          </div>
        )}

        {showModeratorLogin && (
          <div className="moderator-box">
            <input
              type="password"
              placeholder="Пароль модератора"
              value={moderatorPassword}
              onChange={(e) => setModeratorPassword(e.target.value)}
            />
            <button onClick={loginAsModerator}>Войти</button>
          </div>
        )}

        <div className="details">
          {selectedListing.image_url && (
            <img
              src={selectedListing.image_url}
              alt={selectedListing.title}
              className="details-image"
            />
          )}

          {selectedListing.category && (
            <div className="category">{selectedListing.category}</div>
          )}

          <h1>{selectedListing.title}</h1>
          <p className="details-price">{selectedListing.price}</p>

          <h3>Описание</h3>
          <p>{selectedListing.description || 'Нет описания'}</p>

          <h3>Контакты</h3>
          <p>{selectedListing.contacts || 'Контакты не указаны'}</p>

          {isModerator && (
            <button onClick={() => deleteListing(selectedListing.id)}>
              Удалить объявление
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="topbar">
        <h1>Моя барахолка</h1>

        <div className="topbar-actions">
          {!user ? (
            <button onClick={() => setShowAuthBox(true)}>Войти / Регистрация</button>
          ) : (
            <button onClick={signOut}>Выйти ({user.email})</button>
          )}

          {!isModerator ? (
            <button onClick={() => setShowModeratorLogin(true)}>
              Войти как модератор
            </button>
          ) : (
            <button onClick={logoutModerator}>
              Выйти из режима модератора
            </button>
          )}
        </div>
      </div>

      <div className="max-info">
        {maxUser ? (
          <>
            <p><strong>Открыто в MAX</strong></p>
            <p>Пользователь: {maxUser.first_name} {maxUser.last_name}</p>
            <p>Username: {maxUser.username}</p>
            <p>MAX user id: {maxUser.id}</p>
            <p>Платформа: {maxPlatform}</p>
            <p>Версия MAX: {maxVersion}</p>
            {maxStartParam && <p>start_param: {maxStartParam}</p>}
          </>
        ) : (
          <p>Сейчас приложение открыто не из MAX или MAX Bridge ещё не передал данные.</p>
        )}
      </div>

      {showAuthBox && (
        <div className="moderator-box">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button onClick={authMode === 'login' ? signIn : signUp}>
            {authMode === 'login' ? 'Войти' : 'Зарегистрироваться'}
          </button>
          <button
            onClick={() =>
              setAuthMode(authMode === 'login' ? 'signup' : 'login')
            }
          >
            {authMode === 'login' ? 'Нужна регистрация' : 'У меня уже есть аккаунт'}
          </button>
        </div>
      )}

      {showModeratorLogin && (
        <div className="moderator-box">
          <input
            type="password"
            placeholder="Пароль модератора"
            value={moderatorPassword}
            onChange={(e) => setModeratorPassword(e.target.value)}
          />
          <button onClick={loginAsModerator}>Войти</button>
        </div>
      )}

      <div className="filters">
        <button onClick={() => setFilter('Все')}>Все</button>
        <button onClick={() => setFilter('Электроника')}>Электроника</button>
        <button onClick={() => setFilter('Мебель')}>Мебель</button>
        <button onClick={() => setFilter('Транспорт')}>Транспорт</button>
        <button onClick={() => setFilter('Одежда')}>Одежда</button>
        <button onClick={() => setFilter('Другое')}>Другое</button>
      </div>

      <input
        className="search"
        placeholder="Поиск по названию"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {user ? (
        <div className="form">
          <input
            placeholder="Название"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <input
            placeholder="Описание"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <input
            placeholder="Цена"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />

          <input
            placeholder="Контакты"
            value={contacts}
            onChange={(e) => setContacts(e.target.value)}
          />

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="Электроника">Электроника</option>
            <option value="Мебель">Мебель</option>
            <option value="Транспорт">Транспорт</option>
            <option value="Одежда">Одежда</option>
            <option value="Другое">Другое</option>
          </select>

          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files[0])}
          />

          <button onClick={addListing}>
            Добавить объявление
          </button>
        </div>
      ) : (
        <div className="auth-warning">
          Чтобы подать объявление, нужно зарегистрироваться и войти.
        </div>
      )}

      <div className="list">
        {listings
          .filter((item) => filter === 'Все' || item.category === filter)
          .filter((item) =>
            item.title.toLowerCase().includes(search.toLowerCase())
          )
          .map((item) => (
            <ListingCard
              key={item.id}
              title={item.title}
              description={item.description}
              price={item.price}
              category={item.category}
              image_url={item.image_url}
              onOpen={() => openListing(item.id)}
              onDelete={() => deleteListing(item.id)}
              isModerator={isModerator}
            />
          ))}
      </div>
    </div>
  );
}

export default App;