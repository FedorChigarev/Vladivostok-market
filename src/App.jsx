import { useEffect, useState } from 'react';
import './App.css';

function App() {
  const API = 'https://vladivostok-market-server.onrender.com';

  const [listings, setListings] = useState([]);
  const [pending, setPending] = useState([]);

  const [isModerator, setIsModerator] = useState(false);
  const [moderatorPassword, setModeratorPassword] = useState('');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [contacts, setContacts] = useState('');
  const [category, setCategory] = useState('Другое');
  const [imageFile, setImageFile] = useState(null);

  const [userId, setUserId] = useState(null);
  const [userName, setUserName] = useState(null);

  // ===== MAX USER =====
  useEffect(() => {
    if (window.Telegram?.WebApp) {
      const user = window.Telegram.WebApp.initDataUnsafe?.user;
      if (user) {
        setUserId(user.id);
        setUserName(user.first_name);
      }
    } else {
      setUserId(1);
      setUserName('Тест');
    }
  }, []);

  // ===== LOAD PUBLIC =====
  const loadListings = () => {
    fetch(`${API}/listings`)
      .then(res => res.json())
      .then(setListings);
  };

  useEffect(() => {
    loadListings();
  }, []);

  // ===== LOGIN MODERATOR =====
  const loginModerator = () => {
    fetch(`${API}/moderation/pending`, {
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
          setPending(data);
        }
      });
  };

  // ===== LOAD PENDING =====
  const loadPending = () => {
    fetch(`${API}/moderation/pending`, {
      headers: {
        'x-moderator-password': moderatorPassword
      }
    })
      .then(res => res.json())
      .then(setPending);
  };

  // ===== APPROVE =====
  const approve = (id) => {
    fetch(`${API}/moderation/approve/${id}`, {
      method: 'PATCH',
      headers: {
        'x-moderator-password': moderatorPassword
      }
    }).then(() => {
      loadPending();
      loadListings();
    });
  };

  // ===== DELETE =====
  const remove = (id) => {
    fetch(`${API}/listings/${id}`, {
      method: 'DELETE',
      headers: {
        'x-max-user-id': userId,
        'x-moderator-password': moderatorPassword
      }
    }).then(() => {
      loadListings();
      loadPending();
    });
  };

  // ===== CREATE =====
  const submit = async () => {
    const formData = new FormData();

    formData.append('title', title);
    formData.append('description', description);
    formData.append('price', price);
    formData.append('contacts', contacts);
    formData.append('category', category);
    formData.append('max_user_id', userId);
    formData.append('max_user_name', userName);

    if (imageFile) formData.append('image', imageFile);

    const res = await fetch(`${API}/listings`, {
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

  return (
    <div className={isModerator ? 'app moderator-mode' : 'app'}>

      <h1>Моя барахолка</h1>

      <p className="user">👤 {userName}</p>

      {/* ===== MODERATOR LOGIN ===== */}
      {!isModerator && (
        <div className="login-box">
          <input
            type="password"
            placeholder="Пароль модератора"
            value={moderatorPassword}
            onChange={(e) => setModeratorPassword(e.target.value)}
          />
          <button onClick={loginModerator}>
            Войти как модератор
          </button>
        </div>
      )}

      {/* ===== MODERATOR PANEL ===== */}
      {isModerator && (
        <div className="moderator-panel">
          <h2>🟢 Привет, модератор!</h2>

          <button className="logout" onClick={() => setIsModerator(false)}>
            Выйти
          </button>

          <h3>Заявки на модерацию</h3>

          {pending.length === 0 && <p>Нет заявок</p>}

          {pending.map(item => (
            <div key={item.id} className="card">
              <h4>{item.title}</h4>
              <p>{item.description}</p>
              <p>{item.price}</p>

              <div className="actions">
                <button onClick={() => approve(item.id)}>✔ Одобрить</button>
                <button onClick={() => remove(item.id)}>❌ Удалить</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ===== CREATE ===== */}
      <div className="form">
        <input placeholder="Название" value={title} onChange={e => setTitle(e.target.value)} />
        <input placeholder="Описание" value={description} onChange={e => setDescription(e.target.value)} />
        <input placeholder="Цена" value={price} onChange={e => setPrice(e.target.value)} />
        <input placeholder="Контакты" value={contacts} onChange={e => setContacts(e.target.value)} />

        <select value={category} onChange={e => setCategory(e.target.value)}>
          <option>Электроника</option>
          <option>Мебель</option>
          <option>Одежда</option>
          <option>Транспорт</option>
          <option>Другое</option>
        </select>

        <input type="file" onChange={e => setImageFile(e.target.files[0])} />

        <button onClick={submit}>
          Отправить на модерацию
        </button>
      </div>

      {/* ===== LIST ===== */}
      <div className="list">
        {listings.map(item => (
          <div key={item.id} className="card">
            <h4>{item.title}</h4>
            <p>{item.description}</p>
            <p>{item.price}</p>

            <button onClick={() => remove(item.id)}>
              Удалить
            </button>
          </div>
        ))}
      </div>

    </div>
  );
}

export default App;