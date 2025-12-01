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
  IonLoading,
  IonToast,
  IonIcon
} from '@ionic/react';
import { refresh as refreshIcon, refreshCircle as resetIcon } from 'ionicons/icons';
import React, { useState } from 'react';
import axios from 'axios';
import { useHistory } from 'react-router-dom';
import './Register.css';

const Register: React.FC = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordRepeat, setPasswordRepeat] = useState('');
  const [loading, setLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [toastColor, setToastColor] = useState<'success' | 'danger' | 'primary'>('primary');
  const [showToast, setShowToast] = useState(false);

  const history = useHistory();

  const resetForm = () => {
    setUsername('');
    setEmail('');
    setPassword('');
    setPasswordRepeat('');
  };

  const handleRegister = async () => {
    if (!username.trim() || !email.trim() || !password || !passwordRepeat) {
      setToastColor('danger');
      setToastMsg('Veuillez remplir tous les champs.');
      setShowToast(true);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setToastColor('danger');
      setToastMsg("L'adresse e-mail n’est pas valide.");
      setShowToast(true);
      return;
    }

    if (password.length < 6) {
      setToastColor('danger');
      setToastMsg('Le mot de passe doit contenir au moins 6 caractères.');
      setShowToast(true);
      return;
    }

    if (password !== passwordRepeat) {
      setToastColor('danger');
      setToastMsg('Les mots de passe ne correspondent pas.');
      setShowToast(true);
      return;
    }

    setLoading(true);

    try {
      const payload = {
        username: username.trim(),
        email: email.trim(),
        password: password,
        password2: passwordRepeat
      };

      console.log('Envoi au backend:', payload);

      await axios.post('http://localhost:8000/api/register/', payload, {
        headers: { 'Content-Type': 'application/json' }
      });

      setToastColor('success');
      setToastMsg('Compte créé avec succès 🎉 Redirection...');
      setShowToast(true);

      resetForm();

      setTimeout(() => {
        history.push('/');
      }, 1500);
    } catch (err: any) {
      console.error('Erreur backend:', err.response?.data);

      let message = 'Erreur lors de l\'inscription.';
      if (err?.response?.data) {
        const data = err.response.data;
        if (typeof data === 'string') message = data;
        else if (data.detail) message = data.detail;
        else if (typeof data === 'object') {
          message = Object.entries(data)
            .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(' ') : value}`)
            .join(' — ');
        }
      }

      setToastColor('danger');
      setToastMsg(message);
      setShowToast(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <IonPage className="register-page">
      <IonHeader translucent>
        <IonToolbar className="transparent-toolbar">
          <IonTitle>Créer un compte</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="register-content">
        <div className="register-card-mobile">
          <IonText>
            <h1 className="register-title">GroupMe</h1>
            <p className="register-subtitle">Inscription rapide et sécurisée</p>
          </IonText>

          <IonItem className="glass-input">
            <IonLabel position="floating">Nom d'utilisateur</IonLabel>
            <IonInput
              type="text"
              value={username}
              onIonChange={(e) => setUsername(e.detail.value ?? '')}
              disabled={loading}
            />
          </IonItem>

          <IonItem className="glass-input">
            <IonLabel position="floating">Email</IonLabel>
            <IonInput
              type="email"
              value={email}
              onIonChange={(e) => setEmail(e.detail.value ?? '')}
              disabled={loading}
            />
          </IonItem>

          <IonItem className="glass-input">
            <IonLabel position="floating">Mot de passe</IonLabel>
            <IonInput
              type="password"
              value={password}
              onIonChange={(e) => setPassword(e.detail.value ?? '')}
              disabled={loading}
            />
          </IonItem>

          <IonItem className="glass-input">
            <IonLabel position="floating">Répéter le mot de passe</IonLabel>
            <IonInput
              type="password"
              value={passwordRepeat}
              onIonChange={(e) => setPasswordRepeat(e.detail.value ?? '')}
              disabled={loading}
            />
          </IonItem>

          <IonButton
            expand="block"
            className="register-button-mobile"
            onClick={handleRegister}
            disabled={loading}
          >
            {loading ? 'Enregistrement...' : 'Créer le compte'}
          </IonButton>

          <div className="register-actions-mobile">
            <IonButton fill="outline" color="medium" onClick={resetForm} disabled={loading}>
              <IonIcon icon={resetIcon} slot="start" />
              Réinitialiser
            </IonButton>
            <IonButton fill="clear" color="light" onClick={() => window.location.reload()} disabled={loading}>
              <IonIcon icon={refreshIcon} slot="start" />
              Actualiser
            </IonButton>
          </div>

          <IonText className="register-footer-mobile">
            Déjà un compte ?{' '}
            <IonButton fill="clear" color="tertiary" onClick={() => history.push('/')}>
              Se connecter
            </IonButton>
          </IonText>
        </div>

        <IonLoading isOpen={loading} message={'Création du compte...'} />
        <IonToast
          isOpen={showToast}
          message={toastMsg}
          color={toastColor}
          duration={4000}
          onDidDismiss={() => setShowToast(false)}
        />
      </IonContent>
    </IonPage>
  );
};

export default Register;
