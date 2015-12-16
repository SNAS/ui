/**
 * Created by ALEX on 12/15/15.
 */

var timezones = [
  {
    "Abbreviation": "A",
    "Name": "Alpha Time Zone",
    "DisplayName": "Alpha Time Zone(UTC + 1)",
    "Offset": "1"
  },
  {
    "Abbreviation": "ACDT",
    "Name": "Australian Central Daylight Time",
    "DisplayName": "Australian Central Daylight Time(UTC + 10:30)",
    "Offset": "10.5"
  },
  {
    "Abbreviation": "ACST",
    "Name": "Australian Central Standard Time",
    "DisplayName": "Australian Central Standard Time(UTC + 9:30)",
    "Offset": "9.5"
  },
  {
    "Abbreviation": "ADT",
    "Name": "Atlantic Daylight Time",
    "DisplayName": "Atlantic Daylight Time(UTC - 3)",
    "Offset": "-3"
  },
  {
    "Abbreviation": "ADT",
    "Name": "Atlantic Daylight Time",
    "DisplayName": "Atlantic Daylight Time(UTC - 3)",
    "Offset": "-3"
  },
  {
    "Abbreviation": "AEDT",
    "Name": "Australian Eastern Daylight Time",
    "DisplayName": "Australian Eastern Daylight Time(UTC + 11)",
    "Offset": "11"
  },
  {
    "Abbreviation": "AEDT",
    "Name": "Australian Eastern Daylight Time",
    "DisplayName": "Australian Eastern Daylight Time(UTC + 11)",
    "Offset": "11"
  },
  {
    "Abbreviation": "AEST",
    "Name": "Australian Eastern Standard Time",
    "DisplayName": "Australian Eastern Standard Time(UTC + 10)",
    "Offset": "10"
  },
  {
    "Abbreviation": "AFT",
    "Name": "Afghanistan Time",
    "DisplayName": "Afghanistan Time(UTC + 4:30)",
    "Offset": "4.5"
  },
  {
    "Abbreviation": "AKDT",
    "Name": "Alaska Daylight Time",
    "DisplayName": "Alaska Daylight Time(UTC - 8)",
    "Offset": "-8"
  },
  {
    "Abbreviation": "AKST",
    "Name": "Alaska Standard Time",
    "DisplayName": "Alaska Standard Time(UTC - 9)",
    "Offset": "-9"
  },
  {"Abbreviation": "ALMT", "Name": "Alma-Ata Time", "DisplayName": "Alma-Ata Time(UTC + 6)", "Offset": "6"},
  {
    "Abbreviation": "AMST",
    "Name": "Armenia Summer Time",
    "DisplayName": "Armenia Summer Time(UTC + 5)",
    "Offset": "5"
  },
  {
    "Abbreviation": "AMST",
    "Name": "Amazon Summer Time",
    "DisplayName": "Amazon Summer Time(UTC - 3)",
    "Offset": "-3"
  },
  {"Abbreviation": "AMT", "Name": "Armenia Time", "DisplayName": "Armenia Time(UTC + 4)", "Offset": "4"},
  {"Abbreviation": "AMT", "Name": "Amazon Time", "DisplayName": "Amazon Time(UTC - 4)", "Offset": "-4"},
  {
    "Abbreviation": "ANAST",
    "Name": "Anadyr Summer Time",
    "DisplayName": "Anadyr Summer Time(UTC + 12)",
    "Offset": "12"
  },
  {"Abbreviation": "ANAT", "Name": "Anadyr Time", "DisplayName": "Anadyr Time(UTC + 12)", "Offset": "12"},
  {"Abbreviation": "AQTT", "Name": "Aqtobe Time", "DisplayName": "Aqtobe Time(UTC + 5)", "Offset": "5"},
  {"Abbreviation": "ART", "Name": "Argentina Time", "DisplayName": "Argentina Time(UTC - 3)", "Offset": "-3"},
  {
    "Abbreviation": "AST",
    "Name": "Arabia Standard Time",
    "DisplayName": "Arabia Standard Time(UTC + 3)",
    "Offset": "3"
  },
  {
    "Abbreviation": "AST",
    "Name": "Atlantic Standard Time",
    "DisplayName": "Atlantic Standard Time(UTC - 4)",
    "Offset": "-4"
  },
  {
    "Abbreviation": "AST",
    "Name": "Atlantic Standard Time",
    "DisplayName": "Atlantic Standard Time(UTC - 4)",
    "Offset": "-4"
  },
  {
    "Abbreviation": "AST",
    "Name": "Atlantic Standard Time",
    "DisplayName": "Atlantic Standard Time(UTC - 4)",
    "Offset": "-4"
  },
  {
    "Abbreviation": "AWDT",
    "Name": "Australian Western Daylight Time",
    "DisplayName": "Australian Western Daylight Time(UTC + 9)",
    "Offset": "9"
  },
  {
    "Abbreviation": "AWST",
    "Name": "Australian Western Standard Time",
    "DisplayName": "Australian Western Standard Time(UTC + 8)",
    "Offset": "8"
  },
  {"Abbreviation": "AZOST", "Name": "Azores Summer Time", "DisplayName": "Azores Summer Time(UTC)", "Offset": "0"},
  {"Abbreviation": "AZOT", "Name": "Azores Time", "DisplayName": "Azores Time(UTC - 1)", "Offset": "-1"},
  {
    "Abbreviation": "AZST",
    "Name": "Azerbaijan Summer Time",
    "DisplayName": "Azerbaijan Summer Time(UTC + 5)",
    "Offset": "5"
  },
  {"Abbreviation": "AZT", "Name": "Azerbaijan Time", "DisplayName": "Azerbaijan Time(UTC + 4)", "Offset": "4"},
  {"Abbreviation": "B", "Name": "Bravo Time Zone", "DisplayName": "Bravo Time Zone(UTC + 2)", "Offset": "2"},
  {
    "Abbreviation": "BNT",
    "Name": "Brunei Darussalam Time",
    "DisplayName": "Brunei Darussalam Time(UTC + 8)",
    "Offset": "8"
  },
  {"Abbreviation": "BOT", "Name": "Bolivia Time", "DisplayName": "Bolivia Time(UTC - 4)", "Offset": "-4"},
  {
    "Abbreviation": "BRST",
    "Name": "Brasilia Summer Time",
    "DisplayName": "Brasilia Summer Time(UTC - 2)",
    "Offset": "-2"
  },
  {"Abbreviation": "BRT", "Name": "Brasília time", "DisplayName": "Brasília time(UTC - 3)", "Offset": "-3"},
  {
    "Abbreviation": "BST",
    "Name": "Bangladesh Standard Time",
    "DisplayName": "Bangladesh Standard Time(UTC + 6)",
    "Offset": "6"
  },
  {
    "Abbreviation": "BST",
    "Name": "British Summer Time",
    "DisplayName": "British Summer Time(UTC + 1)",
    "Offset": "1"
  },
  {"Abbreviation": "BTT", "Name": "Bhutan Time", "DisplayName": "Bhutan Time(UTC + 6)", "Offset": "6"},
  {"Abbreviation": "C", "Name": "Charlie Time Zone", "DisplayName": "Charlie Time Zone(UTC + 3)", "Offset": "3"},
  {"Abbreviation": "CAST", "Name": "Casey Time", "DisplayName": "Casey Time(UTC + 8)", "Offset": "8"},
  {
    "Abbreviation": "CAT",
    "Name": "Central Africa Time",
    "DisplayName": "Central Africa Time(UTC + 2)",
    "Offset": "2"
  },
  {
    "Abbreviation": "CCT",
    "Name": "Cocos Islands Time",
    "DisplayName": "Cocos Islands Time(UTC + 6:30)",
    "Offset": "6.5"
  },
  {
    "Abbreviation": "CDT",
    "Name": "Cuba Daylight Time",
    "DisplayName": "Cuba Daylight Time(UTC - 4)",
    "Offset": "-4"
  },
  {
    "Abbreviation": "CDT",
    "Name": "Central Daylight Time",
    "DisplayName": "Central Daylight Time(UTC - 5)",
    "Offset": "-5"
  },
  {
    "Abbreviation": "CEST",
    "Name": "Central European Summer Time",
    "DisplayName": "Central European Summer Time(UTC + 2)",
    "Offset": "2"
  },
  {
    "Abbreviation": "CET",
    "Name": "Central European Time",
    "DisplayName": "Central European Time(UTC + 1)",
    "Offset": "1"
  },
  {
    "Abbreviation": "CET",
    "Name": "Central European Time",
    "DisplayName": "Central European Time(UTC + 1)",
    "Offset": "1"
  },
  {
    "Abbreviation": "CHADT",
    "Name": "Chatham Island Daylight Time",
    "DisplayName": "Chatham Island Daylight Time(UTC + 13:45)",
    "Offset": "13.75"
  },
  {
    "Abbreviation": "CHAST",
    "Name": "Chatham Island Standard Time",
    "DisplayName": "Chatham Island Standard Time(UTC + 12:45)",
    "Offset": "12.75"
  },
  {"Abbreviation": "CKT", "Name": "Cook Island Time", "DisplayName": "Cook Island Time(UTC - 10)", "Offset": "-10"},
  {
    "Abbreviation": "CLST",
    "Name": "Chile Summer Time",
    "DisplayName": "Chile Summer Time(UTC - 3)",
    "Offset": "-3"
  },
  {
    "Abbreviation": "CLT",
    "Name": "Chile Standard Time",
    "DisplayName": "Chile Standard Time(UTC - 4)",
    "Offset": "-4"
  },
  {"Abbreviation": "COT", "Name": "Colombia Time", "DisplayName": "Colombia Time(UTC - 5)", "Offset": "-5"},
  {
    "Abbreviation": "CST",
    "Name": "China Standard Time",
    "DisplayName": "China Standard Time(UTC + 8)",
    "Offset": "8"
  },
  {
    "Abbreviation": "CST",
    "Name": "Central Standard Time",
    "DisplayName": "Central Standard Time(UTC - 6)",
    "Offset": "-6"
  },
  {
    "Abbreviation": "CST",
    "Name": "Cuba Standard Time",
    "DisplayName": "Cuba Standard Time(UTC - 5)",
    "Offset": "-5"
  },
  {
    "Abbreviation": "CST",
    "Name": "Central Standard Time",
    "DisplayName": "Central Standard Time(UTC - 6)",
    "Offset": "-6"
  },
  {"Abbreviation": "CVT", "Name": "Cape Verde Time", "DisplayName": "Cape Verde Time(UTC - 1)", "Offset": "-1"},
  {
    "Abbreviation": "CXT",
    "Name": "Christmas Island Time",
    "DisplayName": "Christmas Island Time(UTC + 7)",
    "Offset": "7"
  },
  {
    "Abbreviation": "ChST",
    "Name": "Chamorro Standard Time",
    "DisplayName": "Chamorro Standard Time(UTC + 10)",
    "Offset": "10"
  },
  {"Abbreviation": "D", "Name": "Delta Time Zone", "DisplayName": "Delta Time Zone(UTC + 4)", "Offset": "4"},
  {"Abbreviation": "DAVT", "Name": "Davis Time", "DisplayName": "Davis Time(UTC + 7)", "Offset": "7"},
  {"Abbreviation": "E", "Name": "Echo Time Zone", "DisplayName": "Echo Time Zone(UTC + 5)", "Offset": "5"},
  {
    "Abbreviation": "EASST",
    "Name": "Easter Island Summer Time",
    "DisplayName": "Easter Island Summer Time(UTC - 5)",
    "Offset": "-5"
  },
  {
    "Abbreviation": "EAST",
    "Name": "Easter Island Standard Time",
    "DisplayName": "Easter Island Standard Time(UTC - 6)",
    "Offset": "-6"
  },
  {
    "Abbreviation": "EAT",
    "Name": "Eastern Africa Time",
    "DisplayName": "Eastern Africa Time(UTC + 3)",
    "Offset": "3"
  },
  {"Abbreviation": "EAT", "Name": "East Africa Time", "DisplayName": "East Africa Time(UTC + 3)", "Offset": "3"},
  {"Abbreviation": "ECT", "Name": "Ecuador Time", "DisplayName": "Ecuador Time(UTC - 5)", "Offset": "-5"},
  {
    "Abbreviation": "EDT",
    "Name": "Eastern Daylight Time",
    "DisplayName": "Eastern Daylight Time(UTC - 4)",
    "Offset": "-4"
  },
  {
    "Abbreviation": "EDT",
    "Name": "Eastern Daylight Time",
    "DisplayName": "Eastern Daylight Time(UTC - 4)",
    "Offset": "-4"
  },
  {
    "Abbreviation": "EEST",
    "Name": "Eastern European Summer Time",
    "DisplayName": "Eastern European Summer Time(UTC + 3)",
    "Offset": "3"
  },
  {
    "Abbreviation": "EEST",
    "Name": "Eastern European Summer Time",
    "DisplayName": "Eastern European Summer Time(UTC + 3)",
    "Offset": "3"
  },
  {
    "Abbreviation": "EEST",
    "Name": "Eastern European Summer Time",
    "DisplayName": "Eastern European Summer Time(UTC + 3)",
    "Offset": "3"
  },
  {
    "Abbreviation": "EET",
    "Name": "Eastern European Time",
    "DisplayName": "Eastern European Time(UTC + 2)",
    "Offset": "2"
  },
  {
    "Abbreviation": "EET",
    "Name": "Eastern European Time",
    "DisplayName": "Eastern European Time(UTC + 2)",
    "Offset": "2"
  },
  {
    "Abbreviation": "EET",
    "Name": "Eastern European Time",
    "DisplayName": "Eastern European Time(UTC + 2)",
    "Offset": "2"
  },
  {
    "Abbreviation": "EGST",
    "Name": "Eastern Greenland Summer Time",
    "DisplayName": "Eastern Greenland Summer Time(UTC)",
    "Offset": "0"
  },
  {
    "Abbreviation": "EGT",
    "Name": "East Greenland Time",
    "DisplayName": "East Greenland Time(UTC - 1)",
    "Offset": "-1"
  },
  {
    "Abbreviation": "EST",
    "Name": "Eastern Standard Time",
    "DisplayName": "Eastern Standard Time(UTC - 5)",
    "Offset": "-5"
  },
  {
    "Abbreviation": "EST",
    "Name": "Eastern Standard Time",
    "DisplayName": "Eastern Standard Time(UTC - 5)",
    "Offset": "-5"
  },
  {
    "Abbreviation": "EST",
    "Name": "Eastern Standard Time",
    "DisplayName": "Eastern Standard Time(UTC - 5)",
    "Offset": "-5"
  },
  {"Abbreviation": "ET", "Name": "Tiempo del Este", "DisplayName": "Tiempo del Este(UTC - 5)", "Offset": "-5"},
  {"Abbreviation": "ET", "Name": "Tiempo del Este", "DisplayName": "Tiempo del Este(UTC - 5)", "Offset": "-5"},
  {"Abbreviation": "ET", "Name": "Tiempo Del Este", "DisplayName": "Tiempo Del Este(UTC - 5)", "Offset": "-5"},
  {"Abbreviation": "F", "Name": "Foxtrot Time Zone", "DisplayName": "Foxtrot Time Zone(UTC + 6)", "Offset": "6"},
  {"Abbreviation": "FJST", "Name": "Fiji Summer Time", "DisplayName": "Fiji Summer Time(UTC + 13)", "Offset": "13"},
  {"Abbreviation": "FJT", "Name": "Fiji Time", "DisplayName": "Fiji Time(UTC + 12)", "Offset": "12"},
  {
    "Abbreviation": "FKST",
    "Name": "Falkland Islands Summer Time",
    "DisplayName": "Falkland Islands Summer Time(UTC - 3)",
    "Offset": "-3"
  },
  {
    "Abbreviation": "FKT",
    "Name": "Falkland Island Time",
    "DisplayName": "Falkland Island Time(UTC - 4)",
    "Offset": "-4"
  },
  {
    "Abbreviation": "FNT",
    "Name": "Fernando de Noronha Time",
    "DisplayName": "Fernando de Noronha Time(UTC - 2)",
    "Offset": "-2"
  },
  {"Abbreviation": "G", "Name": "Golf Time Zone", "DisplayName": "Golf Time Zone(UTC + 7)", "Offset": "7"},
  {"Abbreviation": "GALT", "Name": "Galapagos Time", "DisplayName": "Galapagos Time(UTC - 6)", "Offset": "-6"},
  {"Abbreviation": "GAMT", "Name": "Gambier Time", "DisplayName": "Gambier Time(UTC - 9)", "Offset": "-9"},
  {
    "Abbreviation": "GET",
    "Name": "Georgia Standard Time",
    "DisplayName": "Georgia Standard Time(UTC + 4)",
    "Offset": "4"
  },
  {
    "Abbreviation": "GFT",
    "Name": "French Guiana Time",
    "DisplayName": "French Guiana Time(UTC - 3)",
    "Offset": "-3"
  },
  {
    "Abbreviation": "GILT",
    "Name": "Gilbert Island Time",
    "DisplayName": "Gilbert Island Time(UTC + 12)",
    "Offset": "12"
  },
  {"Abbreviation": "GMT", "Name": "Greenwich Mean Time", "DisplayName": "Greenwich Mean Time(UTC)", "Offset": "0"},
  {"Abbreviation": "GMT", "Name": "Greenwich Mean Time", "DisplayName": "Greenwich Mean Time(UTC)", "Offset": "0"},
  {
    "Abbreviation": "GST",
    "Name": "Gulf Standard Time",
    "DisplayName": "Gulf Standard Time(UTC + 4)",
    "Offset": "4"
  },
  {"Abbreviation": "GYT", "Name": "Guyana Time", "DisplayName": "Guyana Time(UTC - 4)", "Offset": "-4"},
  {"Abbreviation": "H", "Name": "Hotel Time Zone", "DisplayName": "Hotel Time Zone(UTC + 8)", "Offset": "8"},
  {
    "Abbreviation": "HAA",
    "Name": "Heure Avancée de l'Atlantique",
    "DisplayName": "Heure Avancée de l'Atlantique(UTC - 3)",
    "Offset": "-3"
  },
  {
    "Abbreviation": "HAA",
    "Name": "Heure Avancée de l'Atlantique",
    "DisplayName": "Heure Avancée de l'Atlantique(UTC - 3)",
    "Offset": "-3"
  },
  {
    "Abbreviation": "HAC",
    "Name": "Heure Avancée du Centre",
    "DisplayName": "Heure Avancée du Centre(UTC - 5)",
    "Offset": "-5"
  },
  {
    "Abbreviation": "HADT",
    "Name": "Hawaii-Aleutian Daylight Time",
    "DisplayName": "Hawaii-Aleutian Daylight Time(UTC - 9)",
    "Offset": "-9"
  },
  {
    "Abbreviation": "HAE",
    "Name": "Heure Avancée de l'Est",
    "DisplayName": "Heure Avancée de l'Est(UTC - 4)",
    "Offset": "-4"
  },
  {
    "Abbreviation": "HAE",
    "Name": "Heure Avancée de l'Est",
    "DisplayName": "Heure Avancée de l'Est(UTC - 4)",
    "Offset": "-4"
  },
  {
    "Abbreviation": "HAP",
    "Name": "Heure Avancée du Pacifique",
    "DisplayName": "Heure Avancée du Pacifique(UTC - 7)",
    "Offset": "-7"
  },
  {
    "Abbreviation": "HAR",
    "Name": "Heure Avancée des Rocheuses",
    "DisplayName": "Heure Avancée des Rocheuses(UTC - 6)",
    "Offset": "-6"
  },
  {
    "Abbreviation": "HAST",
    "Name": "Hawaii-Aleutian Standard Time",
    "DisplayName": "Hawaii-Aleutian Standard Time(UTC - 10)",
    "Offset": "-10"
  },
  {
    "Abbreviation": "HAT",
    "Name": "Heure Avancée de Terre-Neuve",
    "DisplayName": "Heure Avancée de Terre-Neuve(UTC - 2:30)",
    "Offset": "-2.5"
  },
  {
    "Abbreviation": "HAY",
    "Name": "Heure Avancée du Yukon",
    "DisplayName": "Heure Avancée du Yukon(UTC - 8)",
    "Offset": "-8"
  },
  {"Abbreviation": "HKT", "Name": "Hong Kong Time", "DisplayName": "Hong Kong Time(UTC + 8)", "Offset": "8"},
  {
    "Abbreviation": "HLV",
    "Name": "Hora Legal de Venezuela",
    "DisplayName": "Hora Legal de Venezuela(UTC - 4:30)",
    "Offset": "-4.5"
  },
  {
    "Abbreviation": "HNA",
    "Name": "Heure Normale de l'Atlantique",
    "DisplayName": "Heure Normale de l'Atlantique(UTC - 4)",
    "Offset": "-4"
  },
  {
    "Abbreviation": "HNA",
    "Name": "Heure Normale de l'Atlantique",
    "DisplayName": "Heure Normale de l'Atlantique(UTC - 4)",
    "Offset": "-4"
  },
  {
    "Abbreviation": "HNA",
    "Name": "Heure Normale de l'Atlantique",
    "DisplayName": "Heure Normale de l'Atlantique(UTC - 4)",
    "Offset": "-4"
  },
  {
    "Abbreviation": "HNC",
    "Name": "Heure Normale du Centre",
    "DisplayName": "Heure Normale du Centre(UTC - 6)",
    "Offset": "-6"
  },
  {
    "Abbreviation": "HNC",
    "Name": "Heure Normale du Centre",
    "DisplayName": "Heure Normale du Centre(UTC - 6)",
    "Offset": "-6"
  },
  {
    "Abbreviation": "HNE",
    "Name": "Heure Normale de l'Est",
    "DisplayName": "Heure Normale de l'Est(UTC - 5)",
    "Offset": "-5"
  },
  {
    "Abbreviation": "HNE",
    "Name": "Heure Normale de l'Est",
    "DisplayName": "Heure Normale de l'Est(UTC - 5)",
    "Offset": "-5"
  },
  {
    "Abbreviation": "HNE",
    "Name": "Heure Normale de l'Est",
    "DisplayName": "Heure Normale de l'Est(UTC - 5)",
    "Offset": "-5"
  },
  {
    "Abbreviation": "HNP",
    "Name": "Heure Normale du Pacifique",
    "DisplayName": "Heure Normale du Pacifique(UTC - 8)",
    "Offset": "-8"
  },
  {
    "Abbreviation": "HNR",
    "Name": "Heure Normale des Rocheuses",
    "DisplayName": "Heure Normale des Rocheuses(UTC - 7)",
    "Offset": "-7"
  },
  {
    "Abbreviation": "HNT",
    "Name": "Heure Normale de Terre-Neuve",
    "DisplayName": "Heure Normale de Terre-Neuve(UTC - 3:30)",
    "Offset": "-3.5"
  },
  {
    "Abbreviation": "HNY",
    "Name": "Heure Normale du Yukon",
    "DisplayName": "Heure Normale du Yukon(UTC - 9)",
    "Offset": "-9"
  },
  {"Abbreviation": "HOVT", "Name": "Hovd Time", "DisplayName": "Hovd Time(UTC + 7)", "Offset": "7"},
  {"Abbreviation": "I", "Name": "India Time Zone", "DisplayName": "India Time Zone(UTC + 9)", "Offset": "9"},
  {"Abbreviation": "ICT", "Name": "Indochina Time", "DisplayName": "Indochina Time(UTC + 7)", "Offset": "7"},
  {
    "Abbreviation": "IDT",
    "Name": "Israel Daylight Time",
    "DisplayName": "Israel Daylight Time(UTC + 3)",
    "Offset": "3"
  },
  {
    "Abbreviation": "IOT",
    "Name": "Indian Chagos Time",
    "DisplayName": "Indian Chagos Time(UTC + 6)",
    "Offset": "6"
  },
  {
    "Abbreviation": "IRDT",
    "Name": "Iran Daylight Time",
    "DisplayName": "Iran Daylight Time(UTC + 4:30)",
    "Offset": "4.5"
  },
  {
    "Abbreviation": "IRKST",
    "Name": "Irkutsk Summer Time",
    "DisplayName": "Irkutsk Summer Time(UTC + 9)",
    "Offset": "9"
  },
  {"Abbreviation": "IRKT", "Name": "Irkutsk Time", "DisplayName": "Irkutsk Time(UTC + 9)", "Offset": "9"},
  {
    "Abbreviation": "IRST",
    "Name": "Iran Standard Time",
    "DisplayName": "Iran Standard Time(UTC + 3:30)",
    "Offset": "3.5"
  },
  {
    "Abbreviation": "IST",
    "Name": "Israel Standard Time",
    "DisplayName": "Israel Standard Time(UTC + 2)",
    "Offset": "2"
  },
  {
    "Abbreviation": "IST",
    "Name": "India Standard Time",
    "DisplayName": "India Standard Time(UTC + 5:30)",
    "Offset": "5.5"
  },
  {
    "Abbreviation": "IST",
    "Name": "Irish Standard Time",
    "DisplayName": "Irish Standard Time(UTC + 1)",
    "Offset": "1"
  },
  {
    "Abbreviation": "JST",
    "Name": "Japan Standard Time",
    "DisplayName": "Japan Standard Time(UTC + 9)",
    "Offset": "9"
  },
  {"Abbreviation": "K", "Name": "Kilo Time Zone", "DisplayName": "Kilo Time Zone(UTC + 10)", "Offset": "10"},
  {"Abbreviation": "KGT", "Name": "Kyrgyzstan Time", "DisplayName": "Kyrgyzstan Time(UTC + 6)", "Offset": "6"},
  {
    "Abbreviation": "KRAST",
    "Name": "Krasnoyarsk Summer Time",
    "DisplayName": "Krasnoyarsk Summer Time(UTC + 8)",
    "Offset": "8"
  },
  {"Abbreviation": "KRAT", "Name": "Krasnoyarsk Time", "DisplayName": "Krasnoyarsk Time(UTC + 8)", "Offset": "8"},
  {
    "Abbreviation": "KST",
    "Name": "Korea Standard Time",
    "DisplayName": "Korea Standard Time(UTC + 9)",
    "Offset": "9"
  },
  {"Abbreviation": "KUYT", "Name": "Kuybyshev Time", "DisplayName": "Kuybyshev Time(UTC + 4)", "Offset": "4"},
  {"Abbreviation": "L", "Name": "Lima Time Zone", "DisplayName": "Lima Time Zone(UTC + 11)", "Offset": "11"},
  {
    "Abbreviation": "LHDT",
    "Name": "Lord Howe Daylight Time",
    "DisplayName": "Lord Howe Daylight Time(UTC + 11)",
    "Offset": "11"
  },
  {
    "Abbreviation": "LHST",
    "Name": "Lord Howe Standard Time",
    "DisplayName": "Lord Howe Standard Time(UTC + 10:30)",
    "Offset": "10.5"
  },
  {
    "Abbreviation": "LINT",
    "Name": "Line Islands Time",
    "DisplayName": "Line Islands Time(UTC + 14)",
    "Offset": "14"
  },
  {"Abbreviation": "M", "Name": "Mike Time Zone", "DisplayName": "Mike Time Zone(UTC + 12)", "Offset": "12"},
  {
    "Abbreviation": "MAGST",
    "Name": "Magadan Summer Time",
    "DisplayName": "Magadan Summer Time(UTC + 12)",
    "Offset": "12"
  },
  {"Abbreviation": "MAGT", "Name": "Magadan Time", "DisplayName": "Magadan Time(UTC + 12)", "Offset": "12"},
  {"Abbreviation": "MART", "Name": "Marquesas Time", "DisplayName": "Marquesas Time(UTC - 9:30)", "Offset": "-9.5"},
  {"Abbreviation": "MAWT", "Name": "Mawson Time", "DisplayName": "Mawson Time(UTC + 5)", "Offset": "5"},
  {
    "Abbreviation": "MDT",
    "Name": "Mountain Daylight Time",
    "DisplayName": "Mountain Daylight Time(UTC - 6)",
    "Offset": "-6"
  },
  {
    "Abbreviation": "MESZ",
    "Name": "Mitteleuropäische Sommerzeit",
    "DisplayName": "Mitteleuropäische Sommerzeit(UTC + 2)",
    "Offset": "2"
  },
  {
    "Abbreviation": "MEZ",
    "Name": "Mitteleuropäische Zeit",
    "DisplayName": "Mitteleuropäische Zeit(UTC + 1)",
    "Offset": "1"
  },
  {
    "Abbreviation": "MHT",
    "Name": "Marshall Islands Time",
    "DisplayName": "Marshall Islands Time(UTC + 12)",
    "Offset": "12"
  },
  {"Abbreviation": "MMT", "Name": "Myanmar Time", "DisplayName": "Myanmar Time(UTC + 6:30)", "Offset": "6.5"},
  {
    "Abbreviation": "MSD",
    "Name": "Moscow Daylight Time",
    "DisplayName": "Moscow Daylight Time(UTC + 4)",
    "Offset": "4"
  },
  {
    "Abbreviation": "MSK",
    "Name": "Moscow Standard Time",
    "DisplayName": "Moscow Standard Time(UTC + 4)",
    "Offset": "4"
  },
  {
    "Abbreviation": "MST",
    "Name": "Mountain Standard Time",
    "DisplayName": "Mountain Standard Time(UTC - 7)",
    "Offset": "-7"
  },
  {"Abbreviation": "MUT", "Name": "Mauritius Time", "DisplayName": "Mauritius Time(UTC + 4)", "Offset": "4"},
  {"Abbreviation": "MVT", "Name": "Maldives Time", "DisplayName": "Maldives Time(UTC + 5)", "Offset": "5"},
  {"Abbreviation": "MYT", "Name": "Malaysia Time", "DisplayName": "Malaysia Time(UTC + 8)", "Offset": "8"},
  {"Abbreviation": "N", "Name": "November Time Zone", "DisplayName": "November Time Zone(UTC - 1)", "Offset": "-1"},
  {
    "Abbreviation": "NCT",
    "Name": "New Caledonia Time",
    "DisplayName": "New Caledonia Time(UTC + 11)",
    "Offset": "11"
  },
  {
    "Abbreviation": "NDT",
    "Name": "Newfoundland Daylight Time",
    "DisplayName": "Newfoundland Daylight Time(UTC - 2:30)",
    "Offset": "-2.5"
  },
  {"Abbreviation": "NFT", "Name": "Norfolk Time", "DisplayName": "Norfolk Time(UTC + 11:30)", "Offset": "11.5"},
  {
    "Abbreviation": "NOVST",
    "Name": "Novosibirsk Summer Time",
    "DisplayName": "Novosibirsk Summer Time(UTC + 7)",
    "Offset": "7"
  },
  {"Abbreviation": "NOVT", "Name": "Novosibirsk Time", "DisplayName": "Novosibirsk Time(UTC + 6)", "Offset": "6"},
  {"Abbreviation": "NPT", "Name": "Nepal Time", "DisplayName": "Nepal Time(UTC + 5:45)", "Offset": "5.75"},
  {
    "Abbreviation": "NST",
    "Name": "Newfoundland Standard Time",
    "DisplayName": "Newfoundland Standard Time(UTC - 3:30)",
    "Offset": "-3.5"
  },
  {"Abbreviation": "NUT", "Name": "Niue Time", "DisplayName": "Niue Time(UTC - 11)", "Offset": "-11"},
  {
    "Abbreviation": "NZDT",
    "Name": "New Zealand Daylight Time",
    "DisplayName": "New Zealand Daylight Time(UTC + 13)",
    "Offset": "13"
  },
  {
    "Abbreviation": "NZDT",
    "Name": "New Zealand Daylight Time",
    "DisplayName": "New Zealand Daylight Time(UTC + 13)",
    "Offset": "13"
  },
  {
    "Abbreviation": "NZST",
    "Name": "New Zealand Standard Time",
    "DisplayName": "New Zealand Standard Time(UTC + 12)",
    "Offset": "12"
  },
  {
    "Abbreviation": "NZST",
    "Name": "New Zealand Standard Time",
    "DisplayName": "New Zealand Standard Time(UTC + 12)",
    "Offset": "12"
  },
  {"Abbreviation": "O", "Name": "Oscar Time Zone", "DisplayName": "Oscar Time Zone(UTC - 2)", "Offset": "-2"},
  {"Abbreviation": "OMSST", "Name": "Omsk Summer Time", "DisplayName": "Omsk Summer Time(UTC + 7)", "Offset": "7"},
  {
    "Abbreviation": "OMST",
    "Name": "Omsk Standard Time",
    "DisplayName": "Omsk Standard Time(UTC + 7)",
    "Offset": "7"
  },
  {"Abbreviation": "P", "Name": "Papa Time Zone", "DisplayName": "Papa Time Zone(UTC - 3)", "Offset": "-3"},
  {
    "Abbreviation": "PDT",
    "Name": "Pacific Daylight Time",
    "DisplayName": "Pacific Daylight Time(UTC - 7)",
    "Offset": "-7"
  },
  {"Abbreviation": "PET", "Name": "Peru Time", "DisplayName": "Peru Time(UTC - 5)", "Offset": "-5"},
  {
    "Abbreviation": "PETST",
    "Name": "Kamchatka Summer Time",
    "DisplayName": "Kamchatka Summer Time(UTC + 12)",
    "Offset": "12"
  },
  {"Abbreviation": "PETT", "Name": "Kamchatka Time", "DisplayName": "Kamchatka Time(UTC + 12)", "Offset": "12"},
  {
    "Abbreviation": "PGT",
    "Name": "Papua New Guinea Time",
    "DisplayName": "Papua New Guinea Time(UTC + 10)",
    "Offset": "10"
  },
  {
    "Abbreviation": "PHOT",
    "Name": "Phoenix Island Time",
    "DisplayName": "Phoenix Island Time(UTC + 13)",
    "Offset": "13"
  },
  {"Abbreviation": "PHT", "Name": "Philippine Time", "DisplayName": "Philippine Time(UTC + 8)", "Offset": "8"},
  {
    "Abbreviation": "PKT",
    "Name": "Pakistan Standard Time",
    "DisplayName": "Pakistan Standard Time(UTC + 5)",
    "Offset": "5"
  },
  {
    "Abbreviation": "PMDT",
    "Name": "Pierre & Miquelon Daylight Time",
    "DisplayName": "Pierre & Miquelon Daylight Time(UTC - 2)",
    "Offset": "-2"
  },
  {
    "Abbreviation": "PMST",
    "Name": "Pierre & Miquelon Standard Time",
    "DisplayName": "Pierre & Miquelon Standard Time(UTC - 3)",
    "Offset": "-3"
  },
  {
    "Abbreviation": "PONT",
    "Name": "Pohnpei Standard Time",
    "DisplayName": "Pohnpei Standard Time(UTC + 11)",
    "Offset": "11"
  },
  {
    "Abbreviation": "PST",
    "Name": "Pacific Standard Time",
    "DisplayName": "Pacific Standard Time(UTC - 8)",
    "Offset": "-8"
  },
  {
    "Abbreviation": "PST",
    "Name": "Pitcairn Standard Time",
    "DisplayName": "Pitcairn Standard Time(UTC - 8)",
    "Offset": "-8"
  },
  {
    "Abbreviation": "PT",
    "Name": "Tiempo del Pacífico",
    "DisplayName": "Tiempo del Pacífico(UTC - 8)",
    "Offset": "-8"
  },
  {"Abbreviation": "PWT", "Name": "Palau Time", "DisplayName": "Palau Time(UTC + 9)", "Offset": "9"},
  {
    "Abbreviation": "PYST",
    "Name": "Paraguay Summer Time",
    "DisplayName": "Paraguay Summer Time(UTC - 3)",
    "Offset": "-3"
  },
  {"Abbreviation": "PYT", "Name": "Paraguay Time", "DisplayName": "Paraguay Time(UTC - 4)", "Offset": "-4"},
  {"Abbreviation": "Q", "Name": "Quebec Time Zone", "DisplayName": "Quebec Time Zone(UTC - 4)", "Offset": "-4"},
  {"Abbreviation": "R", "Name": "Romeo Time Zone", "DisplayName": "Romeo Time Zone(UTC - 5)", "Offset": "-5"},
  {"Abbreviation": "RET", "Name": "Reunion Time", "DisplayName": "Reunion Time(UTC + 4)", "Offset": "4"},
  {"Abbreviation": "S", "Name": "Sierra Time Zone", "DisplayName": "Sierra Time Zone(UTC - 6)", "Offset": "-6"},
  {"Abbreviation": "SAMT", "Name": "Samara Time", "DisplayName": "Samara Time(UTC + 4)", "Offset": "4"},
  {
    "Abbreviation": "SAST",
    "Name": "South Africa Standard Time",
    "DisplayName": "South Africa Standard Time(UTC + 2)",
    "Offset": "2"
  },
  {
    "Abbreviation": "SBT",
    "Name": "Solomon IslandsTime",
    "DisplayName": "Solomon IslandsTime(UTC + 11)",
    "Offset": "11"
  },
  {"Abbreviation": "SCT", "Name": "Seychelles Time", "DisplayName": "Seychelles Time(UTC + 4)", "Offset": "4"},
  {"Abbreviation": "SGT", "Name": "Singapore Time", "DisplayName": "Singapore Time(UTC + 8)", "Offset": "8"},
  {"Abbreviation": "SRT", "Name": "Suriname Time", "DisplayName": "Suriname Time(UTC - 3)", "Offset": "-3"},
  {
    "Abbreviation": "SST",
    "Name": "Samoa Standard Time",
    "DisplayName": "Samoa Standard Time(UTC - 11)",
    "Offset": "-11"
  },
  {"Abbreviation": "T", "Name": "Tango Time Zone", "DisplayName": "Tango Time Zone(UTC - 7)", "Offset": "-7"},
  {"Abbreviation": "TAHT", "Name": "Tahiti Time", "DisplayName": "Tahiti Time(UTC - 10)", "Offset": "-10"},
  {
    "Abbreviation": "TFT",
    "Name": "French Southern and Antarctic Time",
    "DisplayName": "French Southern and Antarctic Time(UTC + 5)",
    "Offset": "5"
  },
  {"Abbreviation": "TJT", "Name": "Tajikistan Time", "DisplayName": "Tajikistan Time(UTC + 5)", "Offset": "5"},
  {"Abbreviation": "TKT", "Name": "Tokelau Time", "DisplayName": "Tokelau Time(UTC + 13)", "Offset": "13"},
  {"Abbreviation": "TLT", "Name": "East Timor Time", "DisplayName": "East Timor Time(UTC + 9)", "Offset": "9"},
  {"Abbreviation": "TMT", "Name": "Turkmenistan Time", "DisplayName": "Turkmenistan Time(UTC + 5)", "Offset": "5"},
  {"Abbreviation": "TVT", "Name": "Tuvalu Time", "DisplayName": "Tuvalu Time(UTC + 12)", "Offset": "12"},
  {"Abbreviation": "U", "Name": "Uniform Time Zone", "DisplayName": "Uniform Time Zone(UTC - 8)", "Offset": "-8"},
  {"Abbreviation": "ULAT", "Name": "Ulaanbaatar Time", "DisplayName": "Ulaanbaatar Time(UTC + 8)", "Offset": "8"},
  {
    "Abbreviation": "UTC",
    "Name": "Coordinated Universal Time",
    "DisplayName": "Coordinated Universal Time(UTC)",
    "Offset": "0"
  },
  {
    "Abbreviation": "UYST",
    "Name": "Uruguay Summer Time",
    "DisplayName": "Uruguay Summer Time(UTC - 2)",
    "Offset": "-2"
  },
  {"Abbreviation": "UYT", "Name": "Uruguay Time", "DisplayName": "Uruguay Time(UTC - 3)", "Offset": "-3"},
  {"Abbreviation": "UZT", "Name": "Uzbekistan Time", "DisplayName": "Uzbekistan Time(UTC + 5)", "Offset": "5"},
  {"Abbreviation": "V", "Name": "Victor Time Zone", "DisplayName": "Victor Time Zone(UTC - 9)", "Offset": "-9"},
  {
    "Abbreviation": "VET",
    "Name": "Venezuelan Standard Time",
    "DisplayName": "Venezuelan Standard Time(UTC - 4:30)",
    "Offset": "-4.5"
  },
  {
    "Abbreviation": "VLAST",
    "Name": "Vladivostok Summer Time",
    "DisplayName": "Vladivostok Summer Time(UTC + 11)",
    "Offset": "11"
  },
  {"Abbreviation": "VLAT", "Name": "Vladivostok Time", "DisplayName": "Vladivostok Time(UTC + 11)", "Offset": "11"},
  {"Abbreviation": "VUT", "Name": "Vanuatu Time", "DisplayName": "Vanuatu Time(UTC + 11)", "Offset": "11"},
  {"Abbreviation": "W", "Name": "Whiskey Time Zone", "DisplayName": "Whiskey Time Zone(UTC - 10)", "Offset": "-10"},
  {
    "Abbreviation": "WAST",
    "Name": "West Africa Summer Time",
    "DisplayName": "West Africa Summer Time(UTC + 2)",
    "Offset": "2"
  },
  {"Abbreviation": "WAT", "Name": "West Africa Time", "DisplayName": "West Africa Time(UTC + 1)", "Offset": "1"},
  {
    "Abbreviation": "WEST",
    "Name": "Western European Summer Time",
    "DisplayName": "Western European Summer Time(UTC + 1)",
    "Offset": "1"
  },
  {
    "Abbreviation": "WEST",
    "Name": "Western European Summer Time",
    "DisplayName": "Western European Summer Time(UTC + 1)",
    "Offset": "1"
  },
  {
    "Abbreviation": "WESZ",
    "Name": "Westeuropäische Sommerzeit",
    "DisplayName": "Westeuropäische Sommerzeit(UTC + 1)",
    "Offset": "1"
  },
  {
    "Abbreviation": "WET",
    "Name": "Western European Time",
    "DisplayName": "Western European Time(UTC)",
    "Offset": "0"
  },
  {
    "Abbreviation": "WET",
    "Name": "Western European Time",
    "DisplayName": "Western European Time(UTC)",
    "Offset": "0"
  },
  {
    "Abbreviation": "WEZ",
    "Name": "Westeuropäische Zeit",
    "DisplayName": "Westeuropäische Zeit(UTC)",
    "Offset": "0"
  },
  {
    "Abbreviation": "WFT",
    "Name": "Wallis and Futuna Time",
    "DisplayName": "Wallis and Futuna Time(UTC + 12)",
    "Offset": "12"
  },
  {
    "Abbreviation": "WGST",
    "Name": "Western Greenland Summer Time",
    "DisplayName": "Western Greenland Summer Time(UTC - 2)",
    "Offset": "-2"
  },
  {
    "Abbreviation": "WGT",
    "Name": "West Greenland Time",
    "DisplayName": "West Greenland Time(UTC - 3)",
    "Offset": "-3"
  },
  {
    "Abbreviation": "WIB",
    "Name": "Western Indonesian Time",
    "DisplayName": "Western Indonesian Time(UTC + 7)",
    "Offset": "7"
  },
  {
    "Abbreviation": "WIT",
    "Name": "Eastern Indonesian Time",
    "DisplayName": "Eastern Indonesian Time(UTC + 9)",
    "Offset": "9"
  },
  {
    "Abbreviation": "WITA",
    "Name": "Central Indonesian Time",
    "DisplayName": "Central Indonesian Time(UTC + 8)",
    "Offset": "8"
  },
  {
    "Abbreviation": "WST",
    "Name": "Western Sahara Summer Time",
    "DisplayName": "Western Sahara Summer Time(UTC + 1)",
    "Offset": "1"
  },
  {"Abbreviation": "WST", "Name": "West Samoa Time", "DisplayName": "West Samoa Time(UTC + 13)", "Offset": "13"},
  {
    "Abbreviation": "WT",
    "Name": "Western Sahara Standard Time",
    "DisplayName": "Western Sahara Standard Time(UTC)",
    "Offset": "0"
  },
  {"Abbreviation": "X", "Name": "X-ray Time Zone", "DisplayName": "X-ray Time Zone(UTC - 11)", "Offset": "-11"},
  {"Abbreviation": "Y", "Name": "Yankee Time Zone", "DisplayName": "Yankee Time Zone(UTC - 12)", "Offset": "-12"},
  {
    "Abbreviation": "YAKST",
    "Name": "Yakutsk Summer Time",
    "DisplayName": "Yakutsk Summer Time(UTC + 10)",
    "Offset": "10"
  },
  {"Abbreviation": "YAKT", "Name": "Yakutsk Time", "DisplayName": "Yakutsk Time(UTC + 10)", "Offset": "10"},
  {"Abbreviation": "YAPT", "Name": "Yap Time", "DisplayName": "Yap Time(UTC + 10)", "Offset": "10"},
  {
    "Abbreviation": "YEKST",
    "Name": "Yekaterinburg Summer Time",
    "DisplayName": "Yekaterinburg Summer Time(UTC + 6)",
    "Offset": "6"
  },
  {
    "Abbreviation": "YEKT",
    "Name": " Yekaterinburg Time",
    "DisplayName": " Yekaterinburg Time(UTC + 6)",
    "Offset": "6"
  },
  {"Abbreviation": "Z", "Name": "Zulu Time Zone", "DisplayName": "Zulu Time Zone(UTC)", "Offset": "0"}
];
