import { useEffect, useState } from 'react';
import ListingCard from './ListingCard';
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
  const [pendingListings, setPendingListings] = useState([]);
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
  const [maxUser, setMaxUser] = useState(null);
  const [maxStartParam, setMaxStartParam] = useState(null);
  const [maxPlatform, setMaxPlatform] = useState(null);
  const [maxVersion, setMaxVersion] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL;

  const loadListings = async () => {
    try {
      const res = await fetch(`${API_URL}/listings`);
      const data = await res.json();
      setListings(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Ошибка загрузки объявлений:', err);
    }
  };

  const loadPendingListings = async (passwordArg) => {
    const passwordToUse = passwordArg || moderatorPassword;

    if (!passwordToUse) {
      console.log('Нет пароля модератора');
      return;
    }

    try {
      const res = await fetch(`${API_URL}/moderation/pending`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-moderator-password': passwordToUse,
        },
      });

      const data = await res.json();

      console.log('PENDING STATUS:', res.status);
      console.log('PENDING DATA:', data);

      if (!res.ok) {
        alert(data.error || 'Ошибка доступа модератора');
        setPendingListings([]);
        return;
      }

      setPendingListings(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Ошибка загрузки заявок:', err);
      alert('Ошибка загрузки заявок');
      setPendingListings([]);
    }
  };

  useEffect(() => {
    if (API_URL) {
      loadListings();
    }
  }, [API_URL]);

  useEffect(() => {
    const userFromMax = getMaxUser();
    const startParam = getMaxStartParam();
    const platform = getMaxPlatform();
    const version = getMaxVersion();

    setMaxUser(userFromMax);
    setMaxStartParam(startParam);
    setMaxPlatform(platform);
    setMaxVersion(version);

    if (userFromMax) {
      setUser({
        id: userFromMax.id,
        name: `${userFromMax.first_name || ''} ${userFromMax.last_name || ''}`.trim(),
        username: userFromMax.username || '',
      });
    }

    console.log('MAX initData:', getMaxInitData());
    console.log('MAX user:', userFromMax);
    console.log('MAX start_param:', startParam);
    console.log('MAX platform:', platform);
    console.log('MAX version:', version);
  }, []);

  const openListing = async (id) => {
    try {
      const headers = {};

      if (isModerator && moderatorPassword) {
        headers['x-moderator-password'] = moderatorPassword;
      }

      const res = await fetch(`${API_URL}/listings/${id}`, { headers });
      const data = await res.json();

      if (!res.ok) {
        alert(data.error || 'Ошибка загрузки карточки');
        return;
      }

      setSelectedListing(data);
    } catch (err) {
      console.error('Ошибка загрузки карточки:', err);
    }
  };

  const closeListing = () => {
    setSelectedListing(null);
  };

  const sendToModerator = async () => {
    if (!user) {
      alert('Объявление можно подать только из MAX');
      return;
    }

    if (!title || !price) {
      alert('Заполни хотя бы название и цену');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('price', price);
      formData.append('category', category);
      formData.append('contacts', contacts);
      formData.append('max_user_id', user.id);
      formData.append('max_user_name', user.name || 'Пользователь MAX');

      if (imageFile) {
        formData.append('image', imageFile);
      }

      const res = await fetch(`${API_URL}/listings`, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      console.log('POST /listings STATUS:', res.status);
      console.log('POST /listings DATA:', data);

      if (!res.ok) {
        alert(data.error || 'Ошибка отправки объявления');
        return;
      }

      alert(data.message || 'Объявление направлено модератору');

      setTitle('');
      setDescription('');
      setPrice('');
      setCategory('Электроника');
      setContacts('');
      setImageFile(null);

      loadListings();

      if (isModerator) {
        loadPendingListings();
      }
    } catch (err) {
      console.error('Ошибка отправки:', err);
      alert('Сетевая ошибка при отправке');
    }
  };

  const approveListing = async (id) => {
    try {
      const res = await fetch(`${API_URL}/moderation/approve/${id}`, {
        method: 'PATCH',
        headers: {
          'x-moderator-password': moderatorPassword,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || 'Ошибка публикации');
        return;
      }

      alert('Объявление опубликовано');
      loadListings();
      loadPendingListings();
    } catch (err) {
      console.error('Ошибка публикации:', err);
      alert('Ошибка публикации');
    }
  };

  const deleteListing = async (id) => {
    try {
      const headers = {
        'x-max-user-id': user?.id || '',
      };

      if (isModerator) {
        headers['x-moderator-password'] = moderatorPassword;
      }

      const res = await fetch(`${API_URL}/listings/${id}`, {
        method: 'DELETE',
        headers,
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || 'Ошибка удаления');
        return;
      }

      if (selectedListing && selectedListing.id === id) {
        setSelectedListing(null);
      }

      loadListings();

      if (isModerator) {
        loadPendingListings();
      }
    } catch (err) {
      console.error('Ошибка удаления:', err);
      alert('Ошибка удаления');
    }
  };

  const loginAsModerator = async () => {
    if (!moderatorPassword) {
      alert('Введите пароль');
      return;
    }

    try {
      const res = await fetch(`${API_URL}/moderation/pending`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-moderator-password': moderatorPassword,
        },
      });

      const data = await res.json();

      console.log('LOGIN MODERATOR STATUS:', res.status);
      console.log('LOGIN MODERATOR DATA:', data);

      if (!res.ok) {
        alert(data.error || 'Неверный пароль модератора');
        return;
      }

      setIsModerator(true);
      setShowModeratorLogin(false);
      setPendingListings(Array.isArray(data) ? data : []);
      alert('Вы вошли как модератор');
    } catch (err) {
      console.error('Ошибка входа модератора:', err);
      alert('Ошибка входа модератора');
    }
  };

  const logoutModerator = () => {
    setIsModerator(false);
    setModeratorPassword('');
    setPendingListings([]);
    setSelectedListing(null);
    alert('Режим модератора выключен');
  };

  const canDeleteItem = (item) => {
    if (!user) return false;
    if (isModerator) return true;

    return Number(item.max_user_id) === Number(user.id);
  };

  if (selectedListing) {
    return (
      <div className="page">
        <div className="topbar">
          <button onClick={closeListing}>← Назад</button>

          <div className="topbar-actions">
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

          <h3>Автор</h3>
          <p>{selectedListing.max_user_name || 'Неизвестно'}</p>

          {!selectedListing.is_approved && (
            <p className="pending-status">Объявление на модерации</p>
          )}

          <div className="details-actions">
            {isModerator && !selectedListing.is_approved && (
              <button onClick={() => approveListing(selectedListing.id)}>
                Опубликовать
              </button>
            )}

            {(isModerator ||
              Number(selectedListing.max_user_id) === Number(user?.id)) && (
              <button onClick={() => deleteListing(selectedListing.id)}>
                Удалить объявление
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="topbar">
        <h1>Моя барахолка</h1>

        <div className="topbar-actions">
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
            <p>Пользователь: {user?.name}</p>
            <p>Username: {user?.username || 'нет'}</p>
            <p>MAX user id: {user?.id}</p>
            <p>Платформа: {maxPlatform}</p>
            <p>Версия MAX: {maxVersion}</p>
            {maxStartParam && <p>start_param: {maxStartParam}</p>}
          </>
        ) : (
          <p>Открытие только через MAX</p>
        )}
      </div>

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

      {isModerator && (
        <div className="moderation-panel">
          <h2>Заявки на публикацию</h2>

          {pendingListings.length === 0 ? (
            <p>Новых заявок нет</p>
          ) : (
            <div className="list">
              {pendingListings.map((item) => (
                <ListingCard
                  key={item.id}
                  id={item.id}
                  title={item.title}
                  description={item.description}
                  price={item.price}
                  category={item.category}
                  image_url={item.image_url}
                  authorName={item.max_user_name}
                  canDelete={true}
                  isModeratorMode={true}
                  onOpen={() => openListing(item.id)}
                  onDelete={deleteListing}
                  onApprove={approveListing}
                />
              ))}
            </div>
          )}
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

          <button onClick={sendToModerator}>
            Направить модератору
          </button>
        </div>
      ) : (
        <div className="auth-warning">
          Подать объявление можно только из MAX.
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
              id={item.id}
              title={item.title}
              description={item.description}
              price={item.price}
              category={item.category}
              image_url={item.image_url}
              authorName={item.max_user_name}
              canDelete={canDeleteItem(item)}
              isModeratorMode={false}
              onOpen={() => openListing(item.id)}
              onDelete={deleteListing}
              onApprove={approveListing}
            />
          ))}
      </div>
    </div>
  );
}

export default App;