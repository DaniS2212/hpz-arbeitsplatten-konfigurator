# Küchenarbeitsplatten – lokale Entwicklungsfassung 0.2.0

Eigenständig lauffähig, ohne WordPress, Hosting-Zugang oder externe Pakete. Kein installierbares WooCommerce-Plugin und kein öffentliches Deployment. Alle Dateien liegen außerhalb der schreibgeschützten Projektquellen. Es existiert keine Verbindung zum Liveshop.

## Start und Tests

Voraussetzung: Node.js ab 22; geprüft mit dem vorhandenen Node 24.10.0 unter Windows.

Im Ordner dieser Datei:

```powershell
node server.mjs
```

Danach `http://127.0.0.1:4173` öffnen. Der Server lauscht ausschließlich auf dem eigenen Rechner. Beenden mit Strg+C im gestarteten Terminal. Bei belegtem Port keinen fremden Prozess beenden; den eigenen laufenden Server verwenden oder dessen Start beenden.

```powershell
node --test
```

Keine Installation mit npm erforderlich. Keine Shop-Zugangsdaten erforderlich. Nicht auf einen öffentlich erreichbaren Server kopieren. Der Ordner `private/` enthält interne Preisreferenzen; der lokale Server stellt ausschließlich ausdrücklich erlaubte Oberflächendateien bereit.

## Tatsächlich umgesetzt

- Drei lokale Produktfamilien mit drei Schritten (Form, Maße, Oberfläche), großer SVG-Vorschau, dynamischen Maßfeldern, zwei Materialien und festgelegter Dickkante 1,5 mm. W980 und H1145 sind als Referenzdekore eingepflegt; die Muster sind schematisch, keine Originaldekorbilder.
- Responsive Oberfläche, vergrößerbare Zeichnung, anklickbare Bemaßung, Mengenauswahl und gesperrter Warenkorb-Button. Unter `/mobile` können 360/390/768/1280 px Ansichtsbreiten simuliert werden. Echte Smartphone-Tests stehen aus.
- Exakte Dezimalnormalisierung von cm zu ganzen mm, Ablehnung zusätzlicher Nachkommastellen, falscher Familien, fremder Felder und ungültiger Mengen. Die maximale lokale Eingabe von 100000 mm ist eine technische Schutzgrenze, keine behauptete Fertigungsgrenze.
- Rechteckvorschau sowie parametrische L-/U-Familienskizzen, Bemaßung und aktives Maß. Geometrische Innenöffnungen werden geprüft. Abrundung und Abschrägung als Muster an der oberen linken Außenecke, inklusive korrekter Kontur, Fläche und Kantenendpunkte. „Kante durchlaufend“ hat ohne Nachweis keine erfundene geometrische Wirkung.
- Alle neun Speedmaster-IDs sind registriert. L1–L4 und U1–U4 werden ausdrücklich noch nicht als unterschiedliche Lieferantenkonturen ausgegeben. Ihre gemeinsamen Familienskizzen sind keine Speedmaster-Zuordnung und keine Fertigungszeichnung.
- Exakte serverseitige Preisbausteine, 17 Preisreferenzpunkte, Bezugskosten je Einheit, Mengenkalkulation, APL38-Staffelgrenze. Keine Interpolation oder Monotonieannahme. Neue Werte 298,96/290,70 EUR werden entsprechend dem bisherigen Kontext als Netto-Einkauf interpretiert.
- Lokaler HTTP-Vorschauendpunkt mit erneuter Validierung, Konfigurationshash, Eingabegrößenbegrenzung, lokalen Host-/Origin-Prüfungen und ohne Einkaufspreise in Antworten.
- Veraltete Antworten werden verworfen; neue Eingaben und Fehler entfernen die vorherige Vorschau. Es gibt keinen Warenkorb-/Checkout-Endpunkt, alle Kaufstatus bleiben gesperrt.

## Gezielte Grenzen

Die 72 Kombinationen aus neun IDs, vier Eckmustern und zwei Materialien in einem technischen Test sind **keine Freigabe dieses Kreuzprodukts**. Zulässige Lieferantenkombinationen werden erst anhand der Zeichnungen eingetragen.

Teilezerlegung, Stoßzuordnung und Versandteile liefern absichtlich `null`, nicht leere vermeintlich gültige Ergebnisse. Auch die gerade Platte ist noch nicht für Fertigung/Versand freigegeben. Deshalb zeigt die Oberfläche selbst bei passendem Referenzpreis keinen bestellbaren Endpreis. Die reine Kalkulationsfunktion wird mit ausdrücklich vorgegebenen Versandteillängen getestet; sie leitet diese niemals aus den ungeprüften L/U-Gesamtmaßen ab.

Noch nicht implementiert: PHP-/WCPA-Adapter, native WCPA-Formulare, tatsächliche WooCommerce-Produkte, Lieferanten-Geometrien L1–L4/U1–U4, Fertigungsgrenzen, belegte Verfügbarkeit/zwölf Dekorbilder, Gewichte, Warenkorb und Bestellpersistenz. Diese Fassung ersetzt diese offenen Arbeiten nicht.

## Module und spätere Übernahme

| Datei | Aufgabe |
|---|---|
| `core/config.mjs` | Katalog und kanonische Normalisierung |
| `core/geometry.mjs` | Einheitliche Kontur, Bemaßung, Fläche, SVG |
| `private/pricing.mjs` | Referenzprovider, reine Kalkulation, derzeit vollständig gesperrte öffentliche Quote |
| `server.mjs` | Ausschließlich lokaler Vorschau-Server; kein Produktionsdienst |
| `public/app.mjs`, `latest.mjs` | Bedienung und Schutz vor veralteten Antworten |
| `test/core.test.mjs`, `server.test.mjs` | Reproduzierbare Fach- und HTTP-Tests |

Die endgültige Shop-Architektur bleibt PHP + WCPA Pro. Der Node-Server wird nicht auf dem Shop installiert. Normalisierungs-, Geld- und Referenzfälle werden als unabhängige Sollwerte für die PHP-Portierung genutzt; deren PHPUnit-Tests müssen gesondert laufen. Die lokale Bedienoberfläche ist ein Entwicklungsträger, kein zweites Formular neben WCPA im Shop. Der SVG-Renderer kann nach Verifikation in den WCPA-Adapter übernommen werden.

## Preisformeln aus dem anderen Chat

Ein Provider erhält ausschließlich die kanonische Konfiguration und liefert `{net, version, status}` oder `null`. `net` ist derzeit ein positiver EUR-Netto-Lieferantenbetrag mit genau zwei Dezimalstellen. Benötigt werden Form/Eckausführung, Material/Dekor/Profil, Maßbereich und Grenzen, relevante Teilbreite, Version, Belege und unabhängige Vergleichsfälle. Intern dürfen neue Formeln strukturiert ergänzt werden; kein `eval`, keine vom Browser gewählte Regel und kein Fallback auf einen Nachbarpunkt.

`calculate(net, shippingLengthsMm, quantity)` addiert 30 % ausschließlich auf den Einkauf. Danach 10 € plus einmal 50 €, sobald ein bestätigtes Versandteil mindestens 1900 mm misst. Menge wird genau einmal angewandt; Nettopreis bleibt vierstellig dezimal. `deGrossIllustration` ist ausschließlich ein mathematischer 19-%-Testwert, kein internationaler Steueradapter. Bei exakt belegten geraden, eckigen Konfigurationen zeigt die Oberfläche ein ausdrücklich bedingtes Preisbeispiel unter Annahme einer ungeteilten Platte. `price` bleibt null und `purchasable` false. Kundenversand ist weder enthalten noch deaktiviert.

Der vorherige Entwicklungsstand liegt unverändert unter `../archive/ui-v0.1-before-2026-10-20/`. Die neue UI ist vorrangig; zusätzliche Preisrekonstruktion wird zurückgestellt. Ein pauschaler Sicherheitspuffer ohne geprüfte Bereichsgrenzen wird nicht als Deckungsnachweis eingesetzt: unbekannte Fälle bleiben gesperrt.

Siehe `../docs/local-development.md` für Abnahme und verbleibende Integrationsprüfungen.

## Einbettbare Komponente (23.10.2026)

`public/component.mjs` exportiert `mountConfigurator(root, context, adapters)`. Beide lokalen Modi verwenden dieselbe Komponente. Das übergebene Element erhält einen eigenen Shadow Root, Styles und isolierten Zustand. `destroy()` entfernt eigene Inhalte und bricht Requests ab; `updateContext(next)` montiert nach Kontextprüfung neu und setzt die Konfiguration zurück. Nicht innerhalb eines vorhandenen HTML-form mounten.

```js
import {mountConfigurator} from './component.mjs';
const instance = mountConfigurator(element, {
  presentationMode: 'embedded', productId: 1000083
});
// Alternativ sku: 'HPZ-APL-GERADE-2026'. ID und SKU gemeinsam müssen passen.
instance.destroy();
```

Derzeit unterstützter Kontext: presentationMode, productId oder sku, optional family zur Konsistenzprüfung. Instanz-IDs intern vergeben. initialConfiguration, Locale-Wechsel, externe Katalogadapter und Ereignisvertrag noch nicht umgesetzt. Optional `adapters.preview(payload, {signal})` ersetzt die lokale Vorschauabfrage; es existiert absichtlich kein Bestelladapter.

- `/embed?productId=1000083`: Gerade; `1000080`: L; `1000081`: U.
- `/mobile?embedded=1&productId=1000083`: mobile Einbettungsprobe.
- `/component-test`: wiederholbare Browserprüfungen für Isolation und Lebenszyklus.
- `/`: ursprüngliche Demo mit Shell und freier Familienauswahl.

Hoststruktur der Layoutprobe verwendet Platzhalter, keine tatsächlichen Flatsome-Templates. Spätere WCPA-Felder benötigen einen expliziten Adapter zur gekapselten Oberfläche; der aktuelle Formrenderer wird nicht zusätzlich neben einem zweiten WCPA-Bestellformular eingebaut. Das lokale Sicherheitsmodell ist keine Abnahme einer WooCommerce-Bestellintegration.

Aktive Styles liegen in component.css. style.css und die before-straight-Dateien bleiben als bisheriger Stand erhalten. Shellmarkup liegt im Komponenten-Template; im Einbettungsmodus ausgeblendet. Der Generator ../prepare-embedding.mjs war ein einmaliger Migrationsschritt und ist keine Build-Pipeline.
