Opisy prípadov použitia
4.1 UC1 – Vyhľadaj a zobraz produkty
Autor: Maksym Mertsalov
Primárny aktér: Zákazník
Cieľ: Nájsť vhodný produkt v katalógu a zobraziť jeho detail.
Spúšťač: Zákazník otvorí katalóg alebo zadá vyhľadávací výraz.
Predpodmienky
V systéme existujú produkty, kategórie a atribúty produktov.
Systém pozná dostupnosť produktov na sklade.


Hlavný tok
Zákazník otvorí stránku katalógu (napr. “Telefóny”).
Zákazník zadá vyhľadávací výraz alebo nastaví filtre (značka, cena, RAM/úložisko, dostupnosť, triedenie).
Systém overí zadané filtre (napr. rozsahy cien, povolené hodnoty).
Systém vykoná vyhľadávanie nad katalógom a získa množinu produktov.
Systém zobrazí zoznam výsledkov (názov, cena, dostupnosť, základné parametre).
Zákazník otvorí detail vybraného produktu.
Systém zobrazí detail produktu: popis, parametre, obrázky, cenu, dostupnosť a odporúčané podobné produkty.


Alternatívne toky
A1: Žiadne výsledky – systém zobrazí informáciu a odporučí upraviť filtre.
A2: Neplatné filtre (min cena > max cena) – systém odmietne požiadavku a zobrazí chybu.
A3: Produkt dočasne nedostupný – systém zobrazí “nie je skladom” a nedovolí pridať do košíka (alebo ponúkne notifikáciu – voliteľné).


Postpodmienky
Zákazník má zobrazený katalóg alebo detail produktu.
Systém nezmenil stav zásob ani objednávok.



4.2 UC2 – Pridaj, uprav alebo odstráň položky v košíku
Autor: Branislav Ječim
Primárny aktér: Zákazník
Cieľ: Pripraviť košík na objednávku s korektnými množstvami a cenami.
Spúšťač: Zákazník klikne “Pridať do košíka” alebo otvorí košík.
Predpodmienky
Produkt existuje a má cenu.
Dostupnosť je evidovaná v sklade.


Hlavný tok
Zákazník vyberie produkt a zvolí množstvo.
Systém overí, či je požadované množstvo dostupné na sklade.
Ak košík neexistuje, systém ho vytvorí (pre session alebo účet).
Systém pridá položku do košíka alebo navýši existujúce množstvo.
Zákazník otvorí košík.
Zákazník mení množstvá alebo odstraňuje položky.
Systém po každej zmene prepočíta cenu košíka (medzisúčet, prípadné zľavy).
Zákazník pokračuje na checkout.


Alternatívne toky
A1: Nedostatok na sklade – systém ponúkne maximálne dostupné množstvo.
A2: Zmena ceny – systém pri otvorení košíka zistí rozdiel a informuje zákazníka.
A3: Položka už neexistuje v katalógu – systém položku označí ako neplatnú a vyžiada odstránenie.


Postpodmienky
Košík odráža aktuálne položky s validovanými množstvami.
Košík je pripravený na vytvorenie objednávky.


4.3 UC3 – Zadaj údaje a vytvor objednávku
Autor: Danylo Andreiev
Primárny aktér: Registrovaný zákazník (alebo zákazník s emailom pri guest checkout)
Cieľ: Vytvoriť objednávku s dopravou, adresou a platbou.
Spúšťač: Zákazník klikne “Pokračovať k pokladni”.
Predpodmienky
Košík obsahuje aspoň jednu dostupnú položku.
Systém pozná možnosti dopravy a platby.


Hlavný tok
Zákazník otvorí checkout.
Systém načíta košík a opätovne overí dostupnosť a ceny produktov.
Zákazník vyplní/ vyberie dodaciu adresu a fakturačné údaje.
Zákazník zvolí spôsob dopravy (kuriér, odberné miesto, osobný odber).
Systém vypočíta cenu dopravy podľa pravidiel.
Zákazník zvolí spôsob platby (online karta / prevod / dobierka).
Zákazník potvrdí objednávku.
Systém vytvorí objednávku a vygeneruje číslo objednávky.
Systém vykoná rezerváciu skladových množstiev pre položky objednávky.
Systém zobrazí potvrdenie a odošle email so zhrnutím.


Alternatívne toky
A1: Neplatné údaje adresy – systém vráti chybu validácie.
A2: Produkt sa stal nedostupným počas checkoutu – systém zablokuje potvrdenie a vyžiada úpravu košíka.
A3: Guest checkout – systém vytvorí objednávku viazanú na email a kontakt (bez účtu).


Postpodmienky
Objednávka existuje v stave “Vytvorená/Čaká na platbu”.
Sklad je rezervovaný.




4.4 UC4 – Realizuj online platbu a potvrď platbu
Autor: Mykola Malovanyi
Primárny aktér: Zákazník
Sekundárny aktér: Platobná brána
Cieľ: Zaplatiť objednávku online a zmeniť jej stav na “Zaplatená”.
Spúšťač: Zákazník klikne “Zaplatiť” pri objednávke.
Predpodmienky
Objednávka existuje a je v stave “Čaká na platbu”.
Systém má dostupnú integráciu na platobnú bránu.


Hlavný tok
Zákazník iniciuje platbu.
Systém vytvorí záznam platobnej transakcie (interné ID, suma, stav “iniciovaná”).
Systém presmeruje zákazníka na platobnú bránu.
Zákazník vykoná platbu na strane brány.
Platobná brána odošle notifikáciu (callback/webhook) o výsledku.
Systém overí autenticitu notifikácie.
Pri úspechu systém označí transakciu ako “úspešná” a zmení stav objednávky na “Zaplatená”.
Systém spustí ďalší krok procesu (napr. “Na spracovanie” pre expedíciu) a odošle potvrdenie emailom.


Alternatívne toky
A1: Neúspešná platba – transakcia “neúspešná”, objednávka ostáva “Čaká na platbu”.
A2: Zrušenie platby – transakcia “zrušená”, zákazník môže platiť znova.
A3: Duplicitný callback – systém spracuje notifikáciu idempotentne (nezmení stav 2x, len zaloguje).


Postpodmienky
Pri úspechu je objednávka zaplatená a pripravená na ďalšie spracovanie.

4.5 UC5 – Zaregistruj účet
Primárny aktér: Návštevník
Cieľ: Vytvoriť nový používateľský účet v systéme e-shopu.
Spúšťač: Návštevník klikne na tlačidlo „Registrovať sa“.
Predpodmienky
Používateľ ešte nemá vytvorený účet.


Systém umožňuje registráciu nových používateľov.


Hlavný tok
Návštevník otvorí registračný formulár.


Návštevník zadá požadované údaje (meno, email, heslo).


Systém overí správnosť a úplnosť údajov.


Systém vytvorí nový používateľský účet.


Systém zobrazí potvrdenie o úspešnej registrácii.


Alternatívne toky
A1: Email už existuje – systém zobrazí chybové hlásenie.


A2: Neplatné údaje – systém vyzve používateľa na opravu údajov.


Postpodmienky
Používateľský účet je vytvorený.
Používateľ sa môže prihlásiť do systému.

4.6 UC6 – Prihlás sa do účtu
Primárny aktér: Registrovaný zákazník
Cieľ: Získať prístup k používateľskému účtu.
Spúšťač: Používateľ klikne na tlačidlo „Prihlásiť sa“.
Predpodmienky
Používateľ má existujúci účet.
Používateľ pozná svoje prihlasovacie údaje.


Hlavný tok
Používateľ otvorí prihlasovací formulár.


Zadá email a heslo.


Systém overí prihlasovacie údaje.


Systém prihlási používateľa do jeho účtu.


Používateľ získa prístup k svojmu profilu a objednávkam.


Alternatívne toky
A1: Nesprávne prihlasovacie údaje – systém zobrazí chybové hlásenie.


Postpodmienky
Používateľ je prihlásený v systéme.


4.7 UC7 – Zobraz detail produktu
Primárny aktér: Zákazník
Cieľ: Zobraziť podrobné informácie o produkte.
Spúšťač: Zákazník klikne na produkt v katalógu.
Predpodmienky
Produkt existuje v katalógu systému.


Hlavný tok
Zákazník vyhľadá alebo vyberie produkt.


Klikne na vybraný produkt.


Systém zobrazí detail produktu.


Zobrazia sa informácie ako názov, cena, popis, parametre a dostupnosť.


Alternatívne toky
A1: Produkt nie je dostupný – systém zobrazí informáciu o nedostupnosti.


Postpodmienky
Zákazník vidí detail produktu a môže pokračovať v nákupe.

4.8 UC8 – Zobraz svoje objednávky
Primárny aktér: Registrovaný zákazník
Cieľ: Zobraziť zoznam objednávok používateľa.
Spúšťač: Používateľ otvorí sekciu „Moje objednávky“.
Predpodmienky
Používateľ je prihlásený do systému.


Hlavný tok
Používateľ otvorí svoj profil.


Vyberie sekciu „Moje objednávky“.


Systém načíta zoznam objednávok používateľa.


Systém zobrazí zoznam objednávok spolu s ich stavom.


Alternatívne toky
A1: Používateľ nemá žiadne objednávky – systém zobrazí príslušnú informáciu.


Postpodmienky
Používateľ vidí históriu svojich objednávok.



4.9 UC9 – Zruš objednávku
Primárny aktér: Registrovaný zákazník
Cieľ: Zrušiť existujúcu objednávku.
Spúšťač: Používateľ zvolí možnosť „Zrušiť objednávku“.
Predpodmienky
Objednávka existuje.
Objednávka ešte nebola odoslaná.


Hlavný tok
Používateľ otvorí detail objednávky.


Vyberie možnosť zrušenia objednávky.


Systém overí stav objednávky.


Systém zmení stav objednávky na „Zrušená“.


Systém zobrazí potvrdenie o zrušení.


Alternatívne toky
A1: Objednávku už nie je možné zrušiť – systém zobrazí informáciu.


Postpodmienky
Objednávka je označená ako zrušená.



4.10 UC10 – Spravuj produkty v katalógu
Primárny aktér: Administrátor
Cieľ: Spravovať produkty dostupné v katalógu e-shopu.
Spúšťač: Administrátor otvorí administrátorské rozhranie.
Predpodmienky
Administrátor je prihlásený do systému.


Hlavný tok
Administrátor otvorí správu produktov.


Vyberie možnosť pridať, upraviť alebo odstrániť produkt.


Zadá alebo upraví údaje produktu.


Systém uloží zmeny v databáze.


Alternatívne toky
A1: Neplatné údaje produktu – systém zobrazí chybu.


Postpodmienky
Produkt je pridaný alebo upravený v katalógu.





4.11 UC11 – Spracuj objednávku
Primárny aktér: Administrátor / Skladník
Cieľ: Spracovať objednávku po jej zaplatení a pripraviť ju na expedíciu.
Spúšťač: Zamestnanec otvorí zoznam objednávok.
Predpodmienky
Objednávka bola zaplatená.


Hlavný tok
Zamestnanec otvorí zoznam objednávok.


Vyberie konkrétnu objednávku.


Skontroluje obsah objednávky.


Pripraví produkty na expedíciu.


Zmení stav objednávky na „Spracovaná“ alebo „Odoslaná“.


Alternatívne toky
A1: Produkt nie je dostupný – objednávka sa pozastaví.


Postpodmienky
Objednávka je pripravená na odoslanie alebo bola odoslaná.
