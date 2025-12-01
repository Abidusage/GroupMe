import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonInput,
  IonItem,
  IonLabel,
  IonButton,
  IonText,
  IonToast,
  IonLoading
} from '@ionic/react';
import React, { useState } from 'react';
import axios from 'axios';
import { useHistory } from 'react-router-dom';
import './Login.css';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [toastColor, setToastColor] = useState<'success' | 'danger' | 'primary'>('primary');
  const [showToast, setShowToast] = useState(false);

  const history = useHistory();

  const handleLogin = async () => {
    if (!username.trim() || !password) {
      setToastColor('danger');
      setToastMsg('Veuillez remplir tous les champs.');
      setShowToast(true);
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post('http://localhost:8000/api/token/', {
        username: username.trim(),
        password
      });

      localStorage.setItem('accessToken', response.data.access);
      localStorage.setItem('refreshToken', response.data.refresh);

      setToastColor('success');
      setToastMsg('Connexion réussie ! Redirection...');
      setShowToast(true);

      setTimeout(() => history.replace('/app/groups'), 1200);
    } catch (err: any) {
      console.error(err);
      let message = 'Nom d’utilisateur ou mot de passe incorrect';
      if (err?.response?.data) {
        const data = err.response.data;
        if (typeof data === 'string') message = data;
        else if (data.detail) message = data.detail;
      }

      setToastColor('danger');
      setToastMsg(message);
      setShowToast(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <IonPage className="login-page">
      <IonHeader translucent>
        <IonToolbar className="transparent-toolbar">
          <IonTitle>Connexion</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="login-content">
        <div className="login-card-mobile">


          <IonText>
            <h1 className="login-title">GroupMe</h1>
            <p className="login-subtitle">Connectez-vous pour continuer</p>
          </IonText>


          <div className="form-group">
            <IonLabel className="input-label">Nom d’utilisateur</IonLabel>
            <IonItem className="glass-input">
              <IonInput
                type="text"
                placeholder="Entrez votre nom d’utilisateur"
                value={username}
                onIonChange={(e) => setUsername(e.detail.value ?? '')}
                disabled={loading}
              />
            </IonItem>
          </div>


          <div className="form-group">
            <IonLabel className="input-label">Mot de passe</IonLabel>
            <IonItem className="glass-input">
              <IonInput
                type="password"
                placeholder="Entrez votre mot de passe"
                value={password}
                onIonChange={(e) => setPassword(e.detail.value ?? '')}
                disabled={loading}
              />
            </IonItem>
          </div>


          <IonButton
            expand="block"
            className="login-button-mobile"
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </IonButton>

          <IonText className="login-footer-mobile" style={{ display: 'block', marginTop: 12 }}>
            Pas encore de compte ?{' '}
            <IonButton fill="clear" color="tertiary" onClick={() => history.push('/register')}>
              Créer un compte
            </IonButton>
          </IonText>

        </div>


        <IonLoading isOpen={loading} message={'Connexion en cours...'} />


        <IonToast
          isOpen={showToast}
          message={toastMsg}
          color={toastColor}
          duration={3500}
          onDidDismiss={() => setShowToast(false)}
        />
      </IonContent>
    </IonPage>
  );
};

export default Login;
