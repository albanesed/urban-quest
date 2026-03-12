-- Seed: "Il Codice del Biscione" — Novara pilot game
-- IMPORTANT: replace YOUR_AUTH_USER_ID and YOUR_EMAIL before running

-- Operator
INSERT INTO operators (id, auth_user_id, name, slug, email, plan) VALUES (
    'a1b2c3d4-0000-0000-0000-000000000001',
    'YOUR_AUTH_USER_ID',
    'Urban Quest Novara',
    'urban-quest-novara',
    'YOUR_EMAIL',
    'pro'
);

-- Game
INSERT INTO games (id, operator_id, title, slug, description, city, country, status, difficulty, price_cents, duration_min, min_players, max_players, locale, tags) VALUES (
    'b1b2c3d4-0000-0000-0000-000000000001',
    'a1b2c3d4-0000-0000-0000-000000000001',
    'Il Codice del Biscione',
    'codice-del-biscione',
    'Un misterioso cronista medievale ha nascosto un testamento segreto sulla vera storia di Novara. Attraversa la città risolvendo enigmi legati ai monumenti, alle vie e ai luoghi storici reali. Ogni tappa svela un frammento del documento e un pezzo di storia millenaria.',
    'Novara',
    'IT',
    'published',
    'medium',
    0,
    150,
    2,
    6,
    'it',
    ARRAY['storia', 'novara', 'medioevo', 'risorgimento', 'outdoor']
);

-- Stage 1: Barriera Albertina
INSERT INTO stages (id, game_id, order_index, title, description, latitude, longitude, radius_m, unlock_method, narrative_text, estimated_duration_min) VALUES (
    'c1000000-0000-0000-0000-000000000001',
    'b1b2c3d4-0000-0000-0000-000000000001',
    1,
    'Barriera Albertina',
    'Il tuo viaggio inizia dove la Novara moderna incontra la storia risorgimentale. La Barriera Albertina, costruita nel 1836, era una delle porte d''accesso alla città.',
    45.4485,
    8.6197,
    60,
    'qr_and_geo',
    'La Barriera Albertina fu costruita per volere di Carlo Alberto di Savoia come porta monumentale della città. Proprio qui vicino, il 23 marzo 1849, si combatté la Battaglia di Novara, uno degli scontri decisivi del Risorgimento italiano. La sconfitta piemontese portò all''abdicazione di Carlo Alberto in favore del figlio Vittorio Emanuele II, che avrebbe poi completato l''unificazione d''Italia. Il primo frammento del codice recita: "Dove il Re cadde, la nazione risorse."',
    20
);

-- Stage 2: Duomo e Battistero
INSERT INTO stages (id, game_id, order_index, title, description, latitude, longitude, radius_m, unlock_method, narrative_text, estimated_duration_min) VALUES (
    'c1000000-0000-0000-0000-000000000002',
    'b1b2c3d4-0000-0000-0000-000000000001',
    2,
    'Il Duomo e il Battistero Paleocristiano',
    'Nel cuore spirituale di Novara si nasconde uno dei battisteri più antichi del Piemonte. Le sue mura custodiscono segreti che risalgono al V secolo.',
    45.4467,
    8.6210,
    50,
    'qr_and_geo',
    'Il Battistero di Novara risale al V secolo d.C. ed è uno dei più antichi edifici paleocristiani del Piemonte. Fu costruito quando Novara era già sede episcopale sotto San Gaudenzio, primo vescovo della città. All''interno si conservano frammenti di affreschi medievali che raccontano scene bibliche. Il Duomo attuale, ricostruito da Alessandro Antonelli nel XIX secolo, sorge sulle fondamenta di una basilica paleocristiana. Il secondo frammento recita: "Le pietre più antiche parlano la lingua più vera."',
    25
);

-- Stage 3: Broletto
INSERT INTO stages (id, game_id, order_index, title, description, latitude, longitude, radius_m, unlock_method, narrative_text, estimated_duration_min) VALUES (
    'c1000000-0000-0000-0000-000000000003',
    'b1b2c3d4-0000-0000-0000-000000000001',
    3,
    'Il Broletto — Cuore del Potere Comunale',
    'Quattro palazzi, quattro secoli di storia. Il Broletto è il complesso medievale dove si decideva il destino della città. Ogni edificio nasconde un indizio.',
    45.4475,
    8.6220,
    40,
    'qr_and_geo',
    'Il Broletto è un complesso unico formato da quattro palazzi costruiti tra il XIII e il XV secolo, disposti attorno a un cortile centrale. Il Palazzo dell''Arengo (XIII sec.) ospitava le assemblee popolari. Il Palazzo del Podestà era la sede del governo cittadino. Il Palazzo dei Paratici era il luogo delle corporazioni dei mestieri. Il Palazzo dei Referendari, il più recente, serviva per l''amministrazione della giustizia. Novara fu un libero comune dal 1167, membro della Lega Lombarda contro Federico Barbarossa. Il terzo frammento: "Quattro mura, un solo popolo libero."',
    25
);

-- Stage 4: Basilica di San Gaudenzio
INSERT INTO stages (id, game_id, order_index, title, description, latitude, longitude, radius_m, unlock_method, narrative_text, estimated_duration_min) VALUES (
    'c1000000-0000-0000-0000-000000000004',
    'b1b2c3d4-0000-0000-0000-000000000001',
    4,
    'La Cupola dell''Antonelli',
    'La cupola più alta d''Italia in muratura ti osserva da ogni angolo della città. Alessandro Antonelli impiegò quasi 50 anni per completarla. Il suo segreto è nella struttura stessa.',
    45.4453,
    8.6228,
    50,
    'qr_and_geo',
    'La Basilica di San Gaudenzio è il simbolo di Novara. La sua cupola, progettata da Alessandro Antonelli (lo stesso architetto della Mole Antonelliana di Torino), raggiunge i 121 metri di altezza ed è la cupola in muratura più alta d''Italia. La costruzione iniziò nel 1844 e fu completata solo nel 1888, dopo quasi 50 anni di lavori controversi. Antonelli dovette più volte difendere il suo progetto dai dubbi degli amministratori. La cupola non utilizza un''armatura metallica interna: regge grazie a un sistema innovativo di mattoni disposti a spirale. In cima, la statua del Cristo Salvatore in rame dorato è alta 5 metri. Il quarto frammento: "Chi guarda in alto vede il genio, chi guarda dentro vede la follia."',
    25
);

-- Stage 5: Piazza Martiri e Teatro Coccia
INSERT INTO stages (id, game_id, order_index, title, description, latitude, longitude, radius_m, unlock_method, narrative_text, estimated_duration_min) VALUES (
    'c1000000-0000-0000-0000-000000000005',
    'b1b2c3d4-0000-0000-0000-000000000001',
    5,
    'Piazza Martiri e il Teatro Coccia',
    'La piazza principale della città porta il nome dei caduti per la libertà. Accanto, il Teatro Coccia racconta due secoli di cultura novarese.',
    45.4480,
    8.6180,
    50,
    'qr_and_geo',
    'Piazza Martiri della Libertà è il cuore pulsante della Novara moderna. Il nome ricorda i partigiani caduti durante la Resistenza. Il Teatro Coccia, inaugurato nel 1888, è uno dei teatri storici del Piemonte. Prende il nome da Carlo Coccia, compositore e direttore musicale che visse a Novara per oltre 30 anni. Il teatro ha ospitato prime di opere di Verdi, Puccini e Donizetti. Durante la Seconda Guerra Mondiale, Novara subì pesanti bombardamenti ma il teatro fu risparmiato. Il quinto frammento: "Dove si canta, la storia non muore."',
    20
);

-- Stage 6: Castello Visconteo-Sforzesco (Finale)
INSERT INTO stages (id, game_id, order_index, title, description, latitude, longitude, radius_m, unlock_method, narrative_text, estimated_duration_min) VALUES (
    'c1000000-0000-0000-0000-000000000006',
    'b1b2c3d4-0000-0000-0000-000000000001',
    6,
    'Il Castello Visconteo-Sforzesco — Il Gran Finale',
    'L''ultima tappa ti porta alla fortezza che ha dominato Novara per secoli. Qui si nasconde l''ultimo frammento del Codice del Biscione.',
    45.4500,
    8.6170,
    60,
    'qr_and_geo',
    'Il Castello Visconteo-Sforzesco di Novara fu costruito nel XIV secolo dai Visconti di Milano, i cui stemma — il Biscione — dà il nome a questa avventura. Fu ampliato dagli Sforza nel XV secolo e successivamente utilizzato come caserma militare. Oggi ospita mostre ed eventi culturali. Il Biscione, il serpente che divora un uomo, è uno dei simboli araldici più misteriosi d''Italia. Secondo la leggenda, Ottone Visconti lo adottò dopo aver sconfitto un saraceno durante le Crociate. Il sesto e ultimo frammento completa il Codice: "Il serpente custodisce la memoria. Chi conosce la propria storia, possiede il futuro." Congratulazioni, hai completato il Codice del Biscione!',
    20
);

-- Puzzles

-- Stage 1: Barriera Albertina
INSERT INTO puzzles (stage_id, order_index, type, question, answer_hash, answer_display, hints, points, penalty_per_hint) VALUES (
    'c1000000-0000-0000-0000-000000000001',
    1,
    'numeric',
    'La Battaglia di Novara segnò la fine della Prima Guerra d''Indipendenza italiana. In che anno si combatté questa battaglia decisiva? Osserva la Barriera: la data è incisa nella storia della città.',
    crypt('1849', gen_salt('bf')),
    '1849',
    '[{"order": 1, "text": "La battaglia avvenne nella prima metà del XIX secolo."}, {"order": 2, "text": "Fu combattuta un anno dopo le rivoluzioni del 1848."}, {"order": 3, "text": "Carlo Alberto abdicò subito dopo questa sconfitta."}]'::jsonb,
    100,
    25
);

-- Stage 2: Duomo e Battistero
INSERT INTO puzzles (stage_id, order_index, type, question, answer_hash, answer_display, hints, points, penalty_per_hint) VALUES (
    'c1000000-0000-0000-0000-000000000002',
    1,
    'text',
    'Il Battistero è dedicato al primo vescovo di Novara, patrono della città. Il suo nome è ovunque in questa città: in una basilica famosa, in una via, in una piazza. Come si chiamava questo santo?',
    crypt('gaudenzio', gen_salt('bf')),
    'San Gaudenzio',
    '[{"order": 1, "text": "La basilica più famosa di Novara porta il suo nome."}, {"order": 2, "text": "La cupola dell''Antonelli è sulla basilica a lui dedicata."}, {"order": 3, "text": "Il suo nome inizia con la lettera G."}]'::jsonb,
    100,
    25
);

-- Stage 3: Broletto
INSERT INTO puzzles (stage_id, order_index, type, question, answer_hash, answer_display, options, hints, points, penalty_per_hint) VALUES (
    'c1000000-0000-0000-0000-000000000003',
    1,
    'multiple_choice',
    'Il Broletto è composto da quattro palazzi costruiti in epoche diverse. Uno di questi ospitava le assemblee del popolo dove i cittadini decidevano le sorti della città. Come si chiama questo palazzo?',
    crypt('a', gen_salt('bf')),
    'Palazzo dell''Arengo',
    '[{"id": "a", "text": "Palazzo dell''Arengo"}, {"id": "b", "text": "Palazzo dei Paratici"}, {"id": "c", "text": "Palazzo del Podestà"}, {"id": "d", "text": "Palazzo dei Referendari"}]'::jsonb,
    '[{"order": 1, "text": "Il nome deriva da un termine che indica un luogo di riunione pubblica."}, {"order": 2, "text": "''Arengo'' viene da ''aringa'', cioè un discorso pubblico."}]'::jsonb,
    100,
    25
);

-- Stage 4: Cupola Antonelli
INSERT INTO puzzles (stage_id, order_index, type, question, answer_hash, answer_display, hints, points, penalty_per_hint) VALUES (
    'c1000000-0000-0000-0000-000000000004',
    1,
    'numeric',
    'La cupola dell''Antonelli è famosa per essere la più alta cupola in muratura d''Italia. Quanti metri raggiunge in altezza? Guarda in alto e prova a stimare!',
    crypt('121', gen_salt('bf')),
    '121 metri',
    '[{"order": 1, "text": "È più alta di 100 metri."}, {"order": 2, "text": "È compresa tra 115 e 125 metri."}, {"order": 3, "text": "La Mole Antonelliana a Torino è 167 metri. Questa è circa 46 metri più bassa."}]'::jsonb,
    100,
    25
);

-- Stage 5: Teatro Coccia
INSERT INTO puzzles (stage_id, order_index, type, question, answer_hash, answer_display, hints, points, penalty_per_hint) VALUES (
    'c1000000-0000-0000-0000-000000000005',
    1,
    'text',
    'Il Teatro Coccia prende il nome da un musicista che visse a Novara per decenni. Ma qual era il suo ruolo? Non era solo un compositore — aveva un titolo specifico legato alla cattedrale. Che ruolo ricopriva Carlo Coccia a Novara?',
    crypt('direttore musicale', gen_salt('bf')),
    'Direttore musicale (Maestro di Cappella del Duomo)',
    '[{"order": 1, "text": "Il suo ruolo era legato alla musica sacra della cattedrale."}, {"order": 2, "text": "Era il responsabile di tutta la musica eseguita nel Duomo."}, {"order": 3, "text": "Il titolo storico è ''Maestro di Cappella'', ma in termini moderni si direbbe direttore musicale."}]'::jsonb,
    100,
    25
);

-- Stage 6: Castello (Finale) — worth more points
INSERT INTO puzzles (stage_id, order_index, type, question, answer_hash, answer_display, hints, points, penalty_per_hint) VALUES (
    'c1000000-0000-0000-0000-000000000006',
    1,
    'text',
    'Il Biscione — il serpente che divora un uomo — è lo stemma della famiglia che costruì questo castello. Questa potente famiglia governò Milano e gran parte della Lombardia per secoli. Qual è il cognome di questa dinastia?',
    crypt('visconti', gen_salt('bf')),
    'Visconti',
    '[{"order": 1, "text": "La famiglia governava il Ducato di Milano."}, {"order": 2, "text": "Il castello si chiama Castello Visconteo-Sforzesco. Una delle due famiglie lo costruì, l''altra lo ampliò."}, {"order": 3, "text": "Il cognome inizia con V."}]'::jsonb,
    150,
    30
);
