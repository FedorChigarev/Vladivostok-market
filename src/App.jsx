import { useEffect, useState } from 'react';

function App() {
  const [listings, setListings] = useState([]);
  const [pendingListings, setPendingListings] = useState([]);

  const [moderatorPassword, setModeratorPassword] = useState('');
  const [isModerator, setIsModerator] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [contacts, setContacts] = useState('');
  const [category, setCategory] = useState('Другое');
  const [imageFile, setImageFile] = useState(null);

  const [maxUserId, setMaxUserId] = useState(null);
  const [maxUserName, setMaxUserName] = useState(null);

  // ===== MAX данные =====
  useEffect(() => {
    if (window.Telegram?.WebApp) {
      const user = window.Telegram.WebApp.initDataUnsafe?.user;

      if (user) {
        setMaxUserId(user.id);
        setMaxUserName(user.first_name);
      }
    } else {
      // fallback (чтобы тестить в браузере)
      setMaxUserId(123);
      setMaxUserName('Test');
    }
  }, []);

  // ===== загрузка объявлений =====
  const loadListings = () => {
    fetch('https://vladivostok-market-server.onrender.com/listings')
      .then(res => res.json())
      .then(setListings);
  };

  useEffect(() => {
    loadListings();
  }, []);

  // ===== отправка объявления =====
  const submitListing = async () => {
    const formData = new FormData();

    formData.append('title', title);
    formData.append('description', description);
    formData.append('price', price);
    formData.append('contacts', contacts);
    formData.append('category', category);
    formData.append('max_user_id', maxUserId);
    formData.append('max_user_name', maxUserName);

    if (imageFile) {
      formData.append('image', imageFile);
    }

    const res = await fetch('https://vladivostok-market-server.onrender.com/listings', {
      method: 'POST',
      body: formData
    });

    const data = await res.json();

    if (data.error) {
      alert(data.error);
    } else {
      alert('Отправлено модератору');
      setTitle('');
      setDescription('');
      setPrice('');
      setContacts('');
      setImageFile(null);
    }
  };

  // ===== вход модератора =====
  const loginModerator = () => {
    fetch('https://vladivostok-market-server.onrender.com/moderation/pending', {
      headers: {
        'x-moderator-password': moderatorPassword
      }
    })
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          alert('Неверный пароль');
        } else {
          setIsModerator(true);
          setPendingListings(data);
        }
      });
  };

  const loadPending = () => {
    fetch('https://vladivostok-market-server.onrender.com/moderation/pending', {
      headers: {
        'x-moderator-password': moderatorPassword
      }
    })
      .then(res => res.json())
      .then(setPendingListings);
  };

  const approveListing = (id) => {
    fetch(`https://vladivostok-market-server.onrender.com/moderation/approve/${id}`, {
      method: 'PATCH',
      headers: {
        'x-moderator-password': moderatorPassword
      }
    }).then(() => {
      loadPending();
      loadListings();
    });
  };

  const deleteListing = (id) => {
    fetch(`https://vladivostok-market-server.onrender.com/listings/${id}`, {
      method: 'DELETE',
      headers: {
        'x-max-user-id': maxUserId
      }
    }).then(() => loadListings());
  };

  return (
    <div className="container">

      <h1>Моя барахолка</h1>

      <div className="user">
        Пользователь: {maxUserName}
      </div>

      {/* ===== модератор ===== */}
      {!isModerator && (
        <div className="moderator-login">
          <input
            type="password"
            placeholder="Пароль модератора"
            value={moderatorPassword}
            onChange={(e) => setModeratorPassword(e.target.value)}
          />
          <button onClick={loginModerator}>Войти как модератор</button>
        </div>
      )}

      {isModerator && (
        <div className="moderation">
          <h2>Заявки</h2>

          {pendingListings.length === 0 && <p>Нет заявок</p>}

          {pendingListings.map(item => (
            <div key={item.id} className="card">
              <h3>{item.title}</h3>
              <p>{item.description}</p>
              <p>{item.price}</p>
              <p>{item.contacts}</p>

              <button onClick={() => approveListing(item.id)}>Одобрить</button>
            </div>
          ))}
        </div>
      )}

      {/* ===== форма ===== */}
      <div className="form">
        <input placeholder="Название" value={title} onChange={e => setTitle(e.target.value)} />
        <input placeholder="Описание" value={description} onChange={e => setDescription(e.target.value)} />
        <input placeholder="Цена" value={price} onChange={e => setPrice(e.target.value)} />
        <input placeholder="Контакты" value={contacts} onChange={e => setContacts(e.target.value)} />

        <select value={category} onChange={e => setCategory(e.target.value)}>
          <option>Электроника</option>
          <option>Мебель</option>
          <option>Транспорт</option>
          <option>Одежда</option>
          <option>Другое</option>
        </select>

        <input type="file" onChange={e => setImageFile(e.target.files[0])} />

        <button onClick={submitListing}>
          Направить модератору
        </button>
      </div>

      {/* ===== объявления ===== */}
      <div className="list">
        {listings.map(item => (
          <div key={item.id} className="card">
            <h3>{item.title}</h3>
            <p>{item.description}</p>
            <p>{item.price}</p>
            <p>{item.contacts}</p>

            <button onClick={() => deleteListing(item.id)}>
              Удалить
            </button>
          </div>
        ))}
      </div>

    </div>
  );
}

export default App;