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

  const loadListings = () => {
    fetch(`${API}/listings`)
      .then(res => res.json())
      .then(setListings);
  };

  useEffect(() => {
    loadListings();
  }, []);

  const loginModerator = async () => {
    const res = await fetch(`${API}/moderation/pending`, {
      headers: {
        'x-moderator-password': moderatorPassword.trim()
      }
    });

    const data = await res.json();

    console.log('Ответ сервера:', data);

    if (!res.ok || data.error) {
      alert('Неверный пароль');
      return;
    }

    setIsModerator(true);
    setPending(data);
  };

  const loadPending = () => {
    fetch(`${API}/moderation/pending`, {
      headers: {
        'x-moderator-password': moderatorPassword
      }
    })
      .then(res => res.json())
      .then(setPending);
  };

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
    }
  };

  return (
    <div className={isModerator ? 'app moderator-mode' : 'app'}>
      <h1>Моя барахолка</h1>

      <p>👤 {userName}</p>

      {!isModerator && (
        <div>
          <input
            type="password"
            placeholder="Пароль"
            value={moderatorPassword}
            onChange={(e) => setModeratorPassword(e.target.value)}
          />
          <button onClick={loginModerator}>Войти как модератор</button>
        </div>
      )}

      {isModerator && (
        <div>
          <h2>🟢 Привет, модератор!</h2>

          {pending.map(item => (
            <div key={item.id}>
              <p>{item.title}</p>
              <button onClick={() => approve(item.id)}>Одобрить</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;