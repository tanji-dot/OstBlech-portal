MOTORWERK – Mitarbeiterportal + Admin-Panel
===========================================

DATEIEN
-------
index.html          Mitarbeiterportal
admin.html          Admin-Panel
style.css           Schwarz-blaues Design
app.js              Anmeldung, Rollenprüfung, Beiträge
config.js           Supabase-Projektzugangsdaten
supabase-setup.sql  Tabellen, Rollen und Sicherheitsregeln

TEIL 1 – SUPABASE EINRICHTEN
----------------------------
1. Öffne https://supabase.com und erstelle ein Projekt.
2. Öffne im Projekt "SQL Editor" -> "New query".
3. Öffne supabase-setup.sql aus diesem Paket, kopiere den gesamten Inhalt
   in den SQL Editor und klicke auf "Run".
4. Öffne Project Settings -> API (je nach Dashboard-Version auch
   "Connect" / "API Keys").
5. Kopiere die Project URL und den anon/public Key.
6. Öffne config.js und ersetze:
   https://DEIN-PROJEKT.supabase.co
   DEIN_SUPABASE_ANON_PUBLIC_KEY
   durch deine echten Werte.

WICHTIG: Verwende ausschließlich den anon/public Key im Browser.
Niemals den service_role-Key, Datenbankpasswörter oder andere geheime
Schlüssel in config.js oder GitHub veröffentlichen. Die Datenbank wird
durch Row Level Security (RLS) geschützt.

TEIL 2 – BENUTZER ANLEGEN
-------------------------
1. In Supabase: Authentication -> Users -> Add user.
2. Lege für jeden Mitarbeiter ein Konto mit E-Mail und Passwort an.
3. Benutzer erhalten automatisch die Rolle "employee".
4. Für einen Admin: erstelle ebenfalls einen Benutzer.
5. Öffne Table Editor -> profiles und suche die Zeile mit der UUID dieses
   Benutzers. Ändere role von employee auf admin.
6. Mitarbeiter und Admins melden sich auf deiner Website mit diesen
   Konten an. Es gibt absichtlich keine öffentliche Registrierung.

TEIL 3 – AUF GITHUB HOCHLADEN
-----------------------------
1. Melde dich bei https://github.com an.
2. Klicke auf das Pluszeichen -> New repository.
3. Repository-Name z. B. motorwerk-portal.
4. Wähle Public (für GitHub Pages im kostenlosen Standard-Setup).
5. Klicke auf Create repository.
6. Klicke auf "Add file" -> "Upload files".
7. Lade alle Dateien und die SQL-Datei hoch (die SQL-Datei muss nicht
   öffentlich im Repository liegen; aus Sicherheitsgründen kannst du sie
   auch lokal behalten und nicht hochladen).
8. Klicke auf "Commit changes".

TEIL 4 – GITHUB PAGES AKTIVIEREN
--------------------------------
1. Öffne im Repository Settings -> Pages.
2. Unter "Build and deployment" bei Source "Deploy from a branch" wählen.
3. Branch "main" und Ordner "/ (root" auswählen.
4. Save klicken.
5. Warte kurz. GitHub zeigt dir anschließend die Website-Adresse an,
   ungefähr https://DEIN-NAME.github.io/motorwerk-portal/

Die Mitarbeiterseite ist die Startseite. Das Admin-Panel erreichst du über:
https://DEIN-NAME.github.io/motorwerk-portal/admin.html

TEIL 5 – TESTEN
---------------
1. Öffne die GitHub-Pages-Adresse.
2. Melde dich mit einem Mitarbeiterkonto an: Beiträge sollten sichtbar sein.
3. Öffne /admin.html und melde dich mit einem normalen Mitarbeiterkonto an:
   der Zugriff muss verweigert werden.
4. Melde dich mit dem Admin-Konto an, erstelle einen Testbeitrag.
5. Öffne die Mitarbeiterseite in einem zweiten Browserfenster und lade neu:
   der Beitrag sollte erscheinen.

SICHERHEIT UND HINWEISE
-----------------------
- GitHub Pages ist öffentlich erreichbar. Die Anmeldung schützt die Inhalte
  der Datenbank, aber nicht die HTML/CSS/JavaScript-Dateien.
- Veröffentliche keine vertraulichen Kundendaten, privaten Mitarbeiterdaten,
  Passwörter, Zugangscodes oder sicherheitskritischen Betriebsinformationen.
- Die Datenbankregeln (RLS) sind entscheidend. Nicht deaktivieren.
- Der anon/public Key ist für Browser-Apps vorgesehen; er ist kein Passwort.
  Der service_role-Key darf niemals in den Browser gelangen.
- Admin-Rollen nur vertrauenswürdigen Personen geben.
- Diese einfache Projektversion hat noch keine Passwort-zurücksetzen-,
  Profilverwaltungs- oder Dateiupload-Funktion.
- Supabase und GitHub können ihre Menüs ändern; falls ein Menüpunkt anders
  heißt, orientiere dich an den Bereichen Authentication, SQL Editor,
  Project Settings/API und Pages.

FEHLERBEHEBUNG
---------------
"Bitte zuerst config.js ...":
  URL oder anon/public Key in config.js fehlen oder sind noch Platzhalter.

"Invalid login credentials":
  E-Mail/Passwort prüfen; Benutzer muss in Supabase Authentication angelegt sein.

Admin bekommt keinen Zugriff:
  In public.profiles muss bei genau seiner Benutzer-UUID role = admin stehen.

Beiträge laden nicht:
  SQL vollständig ausführen und prüfen, dass RLS eingeschaltet ist.
  Browser-Konsole (F12) zeigt technische Fehler.
