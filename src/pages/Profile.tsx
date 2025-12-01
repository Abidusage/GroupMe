import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonAvatar,
  IonLabel,
  IonItem,
  IonButton,
  IonText,
  IonLoading,
  IonToast
} from '@ionic/react';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Profile.css';

interface User {
  id: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
}

const Profile: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [toastMsg, setToastMsg] = useState('');
  const [showToast, setShowToast] = useState(false);

  const accessToken = localStorage.getItem('accessToken');

  const fetchUser = async () => {
    if (!accessToken) {
      setToastMsg('Utilisateur non authentifié');
      setShowToast(true);
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get('http://localhost:8000/api/user/me/', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setUser(response.data);
    } catch (err: any) {
      console.error(err);
      setToastMsg('Impossible de récupérer les informations utilisateur');
      setShowToast(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    window.location.href = '/';
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Profil</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding ion-text-center">
        {loading ? (
          <IonLoading isOpen={loading} message="Chargement des informations..." />
        ) : user ? (
          <>
            <IonAvatar style={{ margin: '20px auto', width: 100, height: 100 }}>
              <img
                src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
                alt="Avatar utilisateur"
              />
            </IonAvatar>

            <IonItem lines="none">
              <IonLabel className="ion-text-center">
                <IonText color="primary">
                  <h2>{user.username}</h2>
                </IonText>
                <p>{user.email}</p>
                {user.first_name || user.last_name ? (
                  <p>{user.first_name} {user.last_name}</p>
                ) : null}
              </IonLabel>
            </IonItem>

            <IonButton color="danger" expand="block" onClick={handleLogout}>
              Déconnexion
            </IonButton>
          </>
        ) : (
          <IonText color="danger">Impossible de charger le profil.</IonText>
        )}

        <IonToast
          isOpen={showToast}
          message={toastMsg}
          color="danger"
          duration={3000}
          onDidDismiss={() => setShowToast(false)}
        />
      </IonContent>
    </IonPage>
  );
};

export default Profile;
