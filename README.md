<img width="1010" height="833" alt="screen" src="https://github.com/user-attachments/assets/a83db4f1-5548-4809-a8d6-abeff2585609" />
# Nexa Power Flow Card (English)

A modern, animated energy flow card for Home Assistant, specifically optimized for **Nexa 2000** systems. This card provides an intuitive overview of solar production, house consumption, grid interaction, and battery storage.

![Preview](grafik_49.png)

## ✨ Features
*   🚀 **Full Visual Editor:** No YAML skills required. All sensors can be selected via easy-to-use dropdown menus.
*   🎨 **Customizable Design:** Change the card's background color directly within the editor.
*   ⚡ **Live Animations:** Smooth flowing lines visualize current energy movement in real-time.
*   📊 **Daily Totals:** Quick view of today's total solar yield and house consumption right on the card.
*   📱 **Responsive:** Perfectly optimized for smartphones, tablets, and wall-mounted dashboards.

## 🛠 Installation

1. Download the `nexa-power-flow-card.js` file from this repository.
2. Copy the file into your Home Assistant `www` folder (usually located at `/config/www/`).
3. Add the card as a resource in Home Assistant:
    *   Go to **Settings** > **Dashboards** > **Three-dot menu (top right)** > **Resources**.
    *   Click **Add Resource**.
    *   URL: `/local/nexa-power-flow-card.js`
    *   Type: `JavaScript Module`
4. Add a new card to your dashboard, search for "Nexa Power Flow TOTAL", and configure your sensors.

## 📝 Configuration

The visual editor allows you to link the following entities:
*   **Solar Power:** Current production in Watts.
*   **Solar Today:** Total yield of the day in kWh.
*   **Grid Power:** Current grid import (positive) or export (negative).
*   **House Today:** Total house consumption today in kWh.
*   **Battery SoC:** Current battery charge level in %.
*   **Battery Power:** Current charging or discharging power in Watts.

---
Developed by **BaSorg42**

# Nexa Power Flow Card

Eine moderne, animierte Energiefluss-Karte für Home Assistant, speziell optimiert für **Nexa 2000** Systeme. Diese Karte bietet eine intuitive Übersicht über Solarproduktion, Hausverbrauch, Netzbezug und Batteriespeicher.

![Vorschau](grafik_49.png)

## ✨ Features
*   🚀 **Voller Visueller Editor:** Keine YAML-Kenntnisse erforderlich. Alle Sensoren können direkt über Dropdown-Menüs ausgewählt werden.
*   🎨 **Anpassbares Design:** Die Hintergrundfarbe der Karte lässt sich direkt im Editor ändern.
*   ⚡ **Live-Animationen:** Fließende Linien visualisieren den aktuellen Energiefluss in Echtzeit.
*   📊 **Tagesübersicht:** Anzeige der heutigen Gesamtwerte für Solarertrag und Hausverbrauch direkt auf der Karte.
*   📱 **Responsive:** Optimiert für die Anzeige auf Smartphones, Tablets und Wand-Tablets.

## 🛠 Installation

1. Lade die Datei `nexa-power-flow-card.js` aus diesem Repository herunter.
2. Kopiere die Datei in deinen Home Assistant `www` Ordner (meistens unter `/config/www/`).
3. Füge die Karte als Ressource in Home Assistant hinzu:
    *   Gehe zu **Einstellungen** > **Dashboards** > **Drei-Punkte-Menü (oben rechts)** > **Ressourcen**.
    *   Klicke auf **Ressource hinzufügen**.
    *   URL: `/local/nexa-power-flow-card.js`
    *   Typ: `JavaScript Module`
4. Erstelle eine neue Karte auf deinem Dashboard, suche nach "Nexa Power Flow TOTAL" und konfiguriere deine Sensoren.

## 📝 Konfiguration

Im visuellen Editor kannst du folgende Entitäten verknüpfen:
*   **Solar Power:** Aktuelle Erzeugung in Watt.
*   **Solar Heute:** Gesamtertrag des Tages in kWh.
*   **Netz Power:** Aktueller Netzbezug (positiv) oder Einspeisung (negativ).
*   **Haus Heute:** Gesamtverbrauch des Hauses heute in kWh.
*   **Speicher SoC:** Aktueller Ladestand der Batterie in %.
*   **Speicher Power:** Aktuelle Lade- oder Entladeleistung in Watt.



---
Entwickelt von **BaSorg42**
