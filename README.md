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

## Nächste Schritte

- Supabase als Datenbank: Login, kurze Teilen-Links, Wunschzettel auf allen Geräten
- Reservieren durch Gäste (ohne dass die beschenkte Person es sieht)
- Export als PNG für Instagram, Drag & Drop im Editor
- Veröffentlichen auf Vercel
