# 1.0.1 – Einfache Gerade ohne Einzel-Freigaben

Der Kaufpfad enthält keine Speedmaster-Einzelfreigaben, keine angebotsweise Freigabe, keine 30-Tage-Verfallsdaten und keine verpflichtenden Verpackungsdaten. V3 bleibt die serverseitige Preisquelle einschließlich des vorhandenen Beschaffungs-/Speditionsaufschlags. Kundenseitiger Versand wird ausschließlich über die bestehenden WooCommerce-Einstellungen abgerechnet.

Kaufdaten werden HMAC-signiert und bei Warenkorb und Checkout erneut anhand von Maßen, Dekor, Stärke, Ecken und V3 geprüft. Der Shop nimmt weiterhin nur den ursprünglich vorgesehenen deutschen 19-%-Bruttoreferenzpreis an, bis abweichende Steuerländer ausdrücklich getestet sind. Der Versand im Warenkorb nutzt unverändert die normale WooCommerce-Produktkonfiguration.

**Wichtig:** Der öffentliche Verkaufsstart bleibt ein separater Schritt. Der reale Checkout im Liveshop wurde durch GitHub-CI nicht getestet. Keine Speedmaster-API; die Bestellung wird manuell anhand der gespeicherten WooCommerce-Positionsdaten erfasst. Preisreferenz mit 3–5 realen Speedmaster-Konfigurationen vergleichen, bevor öffentlich freigeschaltet wird.
