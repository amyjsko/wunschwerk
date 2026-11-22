# Wunschwerk

Wünsche aus jedem Shop sammeln, als schönen Wunschzettel gestalten und per Link teilen.

## Was der Prototyp kann

- **Wunsch per Link:** Shop-Link einfügen, Titel, Bild und Preis werden automatisch ausgelesen (Open Graph, Schema.org). Klappt das nicht, trägt man die Angaben selbst ein.
- **Wünsche ohne Link**, zum Beispiel „Zeit zusammen“.
- **Herzchen-Priorität, Notizen, Reihenfolge** pro Wunsch.
- **4 Vorlagen:** Weihnachten, Geburtstag, Hochzeit, Schlicht. Dazu Kacheln oder Liste.
- **Teilen:** Link kopieren, per WhatsApp oder E-Mail. Gäste brauchen kein Konto.
- **Drucken / PDF** über den Browser.

Wunschzettel werden im Prototyp nur im eigenen Browser gespeichert. Der Teilen-Link enthält den ganzen Wunschzettel komprimiert.

## Lokal starten

```bash
npm install
npm run dev
```

Dann http://localhost:3000 öffnen.

## Konto und Reservieren (Supabase)

Mit Supabase werden Wunschzettel im Konto gespeichert, bekommen kurze Teilen-Links (`/w/…`)
und Gäste können Wünsche reservieren, ohne dass die beschenkte Person es sieht.

1. Supabase-Projekt anlegen, dann im **SQL Editor** den Inhalt von `supabase/schema.sql` ausführen.
2. Unter **Authentication → URL Configuration** die Site URL auf die Online-Adresse setzen
   und `http://localhost:3000/**` als Redirect URL ergänzen.
3. `NEXT_PUBLIC_SUPABASE_URL` und `NEXT_PUBLIC_SUPABASE_ANON_KEY` setzen: lokal in `.env.local`,
   online in den Vercel-Projekteinstellungen unter Environment Variables.

Ohne diese Werte läuft Wunschwerk wie bisher nur im Browser.

## Nächste Schritte

- Export als PNG für Instagram, Drag & Drop im Editor
- Veröffentlichen auf Vercel
