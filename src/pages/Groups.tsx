import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonButton,
  IonInput,
  IonToast,
  IonCard,
  IonCardHeader,
  IonCardTitle,
} from '@ionic/react';
import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import api from '../api/axiosConfig';

interface Group {
  id: number;
  name: string;
  creator: string;
  message_count?: number;
}

const Groups: React.FC = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [newGroupName, setNewGroupName] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const history = useHistory();

  const fetchGroups = async () => {
    try {
      const res = await api.get('/groups/');
      const groupsWithCount = await Promise.all(
        res.data.map(async (group: Group) => {
          try {
            const messagesRes = await api.get(`/groups/${group.id}/messages/`);
            return { ...group, message_count: messagesRes.data.length };
          } catch {
            return { ...group, message_count: 0 };
          }
        })
      );
      setGroups(groupsWithCount);
    } catch (err: any) {
      if (err.response?.status === 401) {
        localStorage.removeItem('accessToken');
        history.push('/');
      } else {
        setToastMessage('Erreur lors du chargement des groupes.');
      }
    }
  };

  const createGroup = async () => {
    if (!newGroupName.trim()) {
      setToastMessage('Le nom du groupe est requis.');
      return;
    }

    setLoading(true);
    const tempGroup: Group = {
      id: Math.random(),
      name: newGroupName,
      creator: 'Vous',
      message_count: 0,
    };
    setGroups((prev) => [...prev, tempGroup]);
    setNewGroupName('');

    try {
      const res = await api.post('/groups/', { name: newGroupName });
      setGroups((prev) =>
        prev.map((g) => (g.id === tempGroup.id ? { ...res.data, message_count: 0 } : g))
      );
      setToastMessage('Groupe créé avec succès !');
    } catch {
      setGroups((prev) => prev.filter((g) => g.id !== tempGroup.id));
      setToastMessage('Erreur lors de la création du groupe.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
    const interval = setInterval(fetchGroups, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Groupes</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Créer un nouveau groupe</IonCardTitle>
          </IonCardHeader>
          <IonItem>
            <IonLabel position="floating">Nom du groupe</IonLabel>
            <IonInput
              value={newGroupName}
              placeholder="Entrez le nom"
              onIonChange={(e) => setNewGroupName(e.detail.value!)}
              disabled={loading}
            />
          </IonItem>
          <IonButton expand="block" onClick={createGroup} disabled={loading} style={{ margin: '12px' }}>
            Créer
          </IonButton>
        </IonCard>

        <h2 style={{ marginTop: '20px', fontWeight: 'bold' }}>Vos groupes</h2>
        <IonList>
          {groups.map((group) => (
            <IonItem
              key={group.id}
              button
              routerLink={`/app/groups/${group.id}`}
              detail
            >
              <IonLabel>
                <h3>{group.name}</h3>
                <p>{group.message_count ?? 0} messages</p>
              </IonLabel>
            </IonItem>
          ))}
        </IonList>

        <IonToast
          isOpen={!!toastMessage}
          message={toastMessage}
          duration={2500}
          color="primary"
          onDidDismiss={() => setToastMessage('')}
        />
      </IonContent>
    </IonPage>
  );
};

export default Groups;
