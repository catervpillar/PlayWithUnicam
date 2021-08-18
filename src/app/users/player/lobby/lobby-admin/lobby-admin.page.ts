import { AlertCreatorService } from 'src/app/services/alert-creator/alert-creator.service';
import { Component, OnInit } from '@angular/core';
import { ErrorManagerService } from 'src/app/services/error-manager/error-manager.service';
import { LoadingController } from '@ionic/angular';
import { LobbyManagerService } from 'src/app/services/lobby-manager/lobby-manager.service';
import { TimerServiceService } from 'src/app/services/timer-service/timer-service.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-lobby-admin',
  templateUrl: './lobby-admin.page.html',
  styleUrls: ['./lobby-admin.page.scss'],
})
export class LobbyAdminPage implements OnInit {
  segment: string = "impostazioni";
  lobby = { codice: null, admin_lobby: null, pubblica: false, min_giocatori: 0, max_giocatori: 0 };
  giocatori = [];
  private timerGiocatori;


  constructor(
    private alertCreator: AlertCreatorService,
    private errorManager: ErrorManagerService,
    private loadingController: LoadingController,
    private lobbyManager: LobbyManagerService,
    private timerService: TimerServiceService,
    private router: Router
  ) {
    this.loadInfoLobby();
    this.loadGiocatori();
    this.timerGiocatori = timerService.getTimer(() => { this.loadGiocatori() }, 5000);

    window.addEventListener('beforeunload', (event) => {
      event.returnValue = '';
    });

    window.addEventListener('unload', () => {
      this.abbandonaLobby();
    });
  }

  ngOnInit() { }

  segmentChanged(ev: any) {
    this.segment = ev.detail.value;
  }

  //TODO commentare
  async loadInfoLobby() {
    (await this.lobbyManager.loadInfoLobby()).subscribe(
      async (res) => {
        this.lobby = res['results'][0];
        console.log(this.lobby);
      },
      async (res) => {
        this.timerService.stopTimer(this.timerGiocatori);
        this.errorManager.stampaErrore(res, 'Impossibile caricare la Lobby!');
      });
  }

  async loadGiocatori() {
    console.log("sto caricando i giocatori...");

    (await this.lobbyManager.getPartecipanti()).subscribe(
      async (res) => {
        this.giocatori = res['results'];
      },
      async (res) => {
        this.timerService.stopTimer(this.timerGiocatori);
        this.errorManager.stampaErrore(res, 'Impossibile caricare la Lobby!');
      });
  }

  async modificaLobby() {
    const loading = await this.loadingController.create();
    await loading.present();

    (await this.lobbyManager.modificaLobby(this.lobby.pubblica)).subscribe(
      async (res) => {
        await loading.dismiss();
        this.alertCreator.createInfoAlert("Lobby Aggiornata", "Lo stato della Lobby è stato aggiornato.");
      },
      async (res) => {
        await loading.dismiss();
        this.errorManager.stampaErrore(res, 'Modifica fallita');
      }
    );
  }

  async eliminaPartecipante(username, index) {
    this.alertCreator.createConfirmationAlert('Sei sicuro di voler cacciare il giocatore selezionato?',
      async () => {
        (await this.lobbyManager.eliminaPartecipante(username)).subscribe(
          async (res) => {
            this.giocatori.splice(index, 1);
            this.alertCreator.createInfoAlert("Partecipante eliminato", "Il giocatore " + username + " è stato rimosso.");
          },
          async (res) => {
            this.errorManager.stampaErrore(res, 'Eliminazione fallita');
          }
        );
      })
  }

  async abbandonaLobby() {
    this.alertCreator.createConfirmationAlert('Sei sicuro di voler abbandonare la lobby?',
      async () => {
        (await this.lobbyManager.abbandonaLobby()).subscribe(
          async (res) => {
            this.timerService.stopTimer(this.timerGiocatori);
            this.router.navigateByUrl('/player/dashboard', { replaceUrl: true });
          },
          async (res) => {
            this.errorManager.stampaErrore(res, 'Abbandono fallito');
          }
        );
      })
  }
}