**SOA \- turistička aplikacija**  
---

- Projekat mora biti dokerizovan.  
- Projekat mora koristiti NoSQL bazu podataka.  
- Projekat mora biti rasparčan na minimum tri mikroservisa \+ gateway.


**NAPOMENE:**
- Prilozeni su AuthenticationService i Gateway iz drugog projekta, razmisli d li mozes da koristis to sto postoji
- Frontend neka bude u VUE, u strukturi se nalazi frontendprimjer folder sa drugog projekta koji mozes da koristis kao inspiraciju
- localhost 5432 je zauzet od strane druge postgre baze

---

**Uloge u sistemu:**

- Administrator.  
- Vodič (kreator tura).  
- Turista.  
  


**Funkcionalni zahtevi \- predlog za podelu na mikroservise (Auth & Stakeholders servis (PostgreSQL), Blog & Followers servis (MongoDB), Tour servis (PostgreSQL), Purchase & TourExecution servis (PostgreSQL)):** 

1. Neregistrovani korisnik može da se registruje i odabere ulogu Vodiča ili Turiste (admini se ubaciju direktno u bazu). Nalog obuhvata: korisničko ime, lozinku, mejl, ulogu (vodič, turista, administrator). (1. KT)

2. Svaki korisnik (vodič, turista) može da pregleda svoj profil koji obuhvata: ime, prezime, profilnu sliku, biografiju, moto (citat). (1. KT)  
     
3. Korisnik može da menja informacije sa svog profila. (1. KT)

4. Korisnik može da kreira blog koji obuhvata: naslov (temu), opis, datum kreiranja, slike  
     
5. Korisnik može da zaprati druge korisnike (klikom na button follow), tek nakon što je zapratio korisnika može da ostavi komentar na njegov blog

6. Autor može da kreira turu tako što navodi naziv ture, opis, težinu i tagove koji opisuju turu. Pri početnom kreiranju ture, tura treba da ima status draft i da joj je cena postavljena na 0\. Autor može da vidi sve svoje ture. (2. KT)  
     
7. Autor navodi ključne tačke za turu tako što na mapi bira određenu lokaciju. Informacija o geografskoj širini i dužini se beleži, zajedno sa nazivom, opisom i slikom (npr. ključna tačka može biti neki muzej, park, spomenik). Pod kljucne tacke misli se samo na pocetnu i krajnju tacku

8. Simulator pozicije je funkcionalnost koju koristimo u nedostatku mobilne aplikacije. Turista otvara stranicu za simulator koja prikazuje mapu. Mapa iscrtava njegov trenutni položaj ako ga je prethodno definisao. Turista može da klikne na mapu pri čemu simulator beleži lokaciju kao trenutnu lokaciju turiste. Za trenutnu lokaciju se beleže lat i long. Informaciju gde se turista nalazi će koristiti izvedba ture (TourExecution) definisana dole. (2. KT)  
     
9. Turista može kupiti objavljenu turu tako što će je prvo smestiti u svoju korpu (ShoppingCart). Svaka stavka (OrderItem) u korpi sadrži ime ture, cenu i id ture.  
   Korpa računa ukupnu cenu svih stavki u korpi prilikom dodavanja ili uklanjanja nečega iz korpe. Kada je turista zadovoljan stanjem u korpi, ide na checkout i za svaku stavku iz korpe dobija token (TourPurchaseToken) koji označava da je stavka kupljena.  
   Turista vidi samo deo informacija o turama dok ih ne kupi: opis, dužinu, vreme prolaska, slike, početnu tačku i recenzije. Ture koje su kupljene otkrivaju sve ključne tačke. Arhivirane ture se ne mogu kupiti. (3. KT)  
     
10. Turista može pokrenuti turu, pri čemu se kreira sesija (TourExecution). Sesija se završava kada turista završi (completed) ili napusti turu (abandoned). Tom prilikom se evidentira vreme napuštanja/kompletiranja. Kada turista pokrene turu, beleži se lokacija turiste (front-end prvo dobija lokaciju putem Position simulatora).  
    Na ekranu za aktivnu turu, front-end na svakih 10 sekundi šalje zahtev da se proveri da li je turista blizu neke ključne tačke (Napomena: Prvo pita Position simulator gde se nalazi, pa onda šalje novi zahtev na back). Ako jeste, u sesiji se beleži da je turista kompletirao tu ključnu tačku i beleži se vreme kada je dostigao. Bez obzira na ishod, beleži se last activity DateTime na nivou TourExecution objekta.  
    Turista može da pokrene objavljene i arhivirane ture. Kada se uvede kupovina, preduslov za pokretanje ture je da je kupljena. (3. KT)

