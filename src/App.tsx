import React from 'react';
import { Redirect, Route } from 'react-router-dom';
import {
  IonApp,
  IonRouterOutlet,
  setupIonicReact,
  IonTabs,
  IonTabBar,
  IonTabButton,
  IonLabel,
  IonIcon
} from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { home as homeIcon, person as personIcon } from 'ionicons/icons';


import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Groups from './pages/Groups';
import GroupChat from './pages/GroupChat';

import PrivateRoute from './components/PrivateRoute';


import '@ionic/react/css/core.css';
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';
import './theme/variables.css';
import './theme/chat.css';

setupIonicReact();

const App: React.FC = () => {
  const isAuthenticated = !!localStorage.getItem("accessToken");

  return (
    <IonApp>
      <IonReactRouter>
        <IonRouterOutlet>

          
          <Route
            exact
            path="/"
            render={() => (isAuthenticated ? <Redirect to="/app/groups" /> : <Login />)}
          />
          <Route
            exact
            path="/register"
            render={() => (isAuthenticated ? <Redirect to="/app/groups" /> : <Register />)}
          />

       
          <Route
            path="/app"
            render={() =>
              isAuthenticated ? (
                <IonTabs>
                  <IonRouterOutlet>
                    <PrivateRoute exact path="/app/groups" component={Groups} />
                    <PrivateRoute exact path="/app/groups/:id" component={GroupChat} />
                    <PrivateRoute exact path="/app/profile" component={Profile} />
                    <Redirect exact from="/app" to="/app/groups" />
                  </IonRouterOutlet>

                  <IonTabBar slot="bottom">
                    <IonTabButton tab="groups" href="/app/groups">
                      <IonIcon icon={homeIcon} />
                      <IonLabel>Groupes</IonLabel>
                    </IonTabButton>
                    <IonTabButton tab="profile" href="/app/profile">
                      <IonIcon icon={personIcon} />
                      <IonLabel>Profil</IonLabel>
                    </IonTabButton>
                  </IonTabBar>
                </IonTabs>
              ) : (
                <Redirect to="/" />
              )
            }
          />

        </IonRouterOutlet>
      </IonReactRouter>
    </IonApp>
  );
};

export default App;
