import PropTypes from "prop-types";
import MuiDataTable from "./MuiDataTable";
import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import styles from "./../../styles/Home.module.css";
import InputUom from "./InputUom";
import LabelWithIcon from '../basicComponents/LabelWithIcon';
import LabelWithInfo from '../basicComponents/LabelWithInfo';
import LabeledInput from "../basicComponents/LabeledInput";
import Button from "../basicComponents/Button";
import CustomToolTip from "../basicComponents/ToolTip";

// const totalReqArea = {
//                       "fieldName": "totalRequiredArea",
//                       "label": "Total Required Area",
//                       "type": "inputUom",
//                       "fieldDisplayOrder": 1,
//                       "isValidationRequired": true,
//                       "validateActionType": "both",
//                       "mandatory": false,
//                       "defaultValue": {
//                           "totalRequiredArea": ""
//                       },
//                       "disabled": false,
//                       "disableUOM": false,
//                       "visible": true,
//                       "hideFromSideBar": true,
//                       "options":[
//                                   {
//                                   "label":"in",
//                                   "value":"length.in",                                    
//                                   "UpdatedAt": "2024-06-22T10:28:06.344Z",
//                                       "UnitOffset": "0",
//                                       "DisplayPrecision": 3,
//                                       "IsDefault": true,
//                                       "CreatedAt": "2024-06-22T10:28:06.344Z",
//                                       "Id": 72,
//                                       "UnitFactor": "39.37007874015744",
//                                       "DimensionName": "length",
//                                       "UnitKey": "length.in",
//                                       "UnitName": "in",
//                                       "UnitLongName": "inches",
//                                       "SystemUnit": "English"
//                                   },
//                                   {
//                                   "label":"mm",
//                                   "value":"length.mm",                                      
//                                   "UpdatedAt": "2024-06-22T10:28:06.344Z",
//                                       "UnitOffset": "0",
//                                       "DisplayPrecision": 3,
//                                       "IsDefault": false,
//                                       "CreatedAt": "2024-06-22T10:28:06.344Z",
//                                       "Id": 74,
//                                       "UnitFactor": "1000",
//                                       "DimensionName": "length",
//                                       "UnitKey": "length.mm",
//                                       "UnitName": "mm",
//                                       "UnitLongName": "millimeters",
//                                       "SystemUnit": "Metric"
//                                   },
//                                   {
//                                   "label":"ft",
//                                   "value":"length.ft",                                      
//                                   "UpdatedAt": "2024-06-22T10:28:06.343Z",
//                                       "UnitOffset": "0",
//                                       "DisplayPrecision": 3,
//                                       "IsDefault": true,
//                                       "CreatedAt": "2024-06-22T10:28:06.343Z",
//                                       "Id": 71,
//                                       "UnitFactor": "3.28083989501312",
//                                       "DimensionName": "length",
//                                       "UnitKey": "length.ft",
//                                       "UnitName": "ft",
//                                       "UnitLongName": "feet",
//                                       "SystemUnit": "English"
//                                   },
//                                   {
//                                   "label":"cm",
//                                   "value":"length.cm",                                      
//                                   "UpdatedAt": "2024-06-22T10:28:06.343Z",
//                                       "UnitOffset": "0",
//                                       "DisplayPrecision": 3,
//                                       "IsDefault": true,
//                                       "CreatedAt": "2024-06-22T10:28:06.343Z",
//                                       "Id": 70,
//                                       "UnitFactor": "100",
//                                       "DimensionName": "length",
//                                       "UnitKey": "length.cm",
//                                       "UnitName": "cm",
//                                       "UnitLongName": "centimeters",
//                                       "SystemUnit": "Metric"
//                                   },
//                                   {
//                                   "label":"m",
//                                   "value":"length.m",  
//                                   "UpdatedAt": "2024-06-22T10:28:06.344Z",
//                                       "UnitOffset": "0",
//                                       "DisplayPrecision": 3,
//                                       "IsDefault": false,
//                                       "CreatedAt": "2024-06-22T10:28:06.344Z",
//                                       "Id": 73,
//                                       "UnitFactor": "1",
//                                       "DimensionName": "length",
//                                       "UnitKey": "length.m",
//                                       "UnitName": "m",
//                                       "UnitLongName": "meters",
//                                       "SystemUnit": "Metric"
//                                   }
//                               ],
//                       "dimensionName": [
//                           "length"
//                       ],
//                       "infoText": "Total Selected Area",
//                       "grid": "3",
//                       "style": null,
//                       "regex": "NOT_ALLOW_NEGATIVE",
//                       "uomFieldName": "LengthUOM",
//                       "defaultUOM": {
//                           "Metric": "length.in",
//                           "English": "length.in"
//                       },
//                       "defaultUOMValue": "length.in",
//                       "value": "14",
//                       "error": null,
//                       "uomValue": "length.in",
//                       "visibility": true,
//                       "fieldList": null,
//                       "funcExecResultFields": [],
//                       "focusedFieldName": ""
//                   }
// const totalSelectedArea = {
//                       "fieldName": "totalSelectedArea",
//                       "label": "Total Selected Area",
//                       "type": "inputUom",
//                       "fieldDisplayOrder": 1,
//                       "isValidationRequired": true,
//                       "validateActionType": "both",
//                       "mandatory": false,
//                       "defaultValue": {
//                           "totalRequiredArea": ""
//                       },
//                       "disabled": false,
//                       "disableUOM": false,
//                       "visible": true,
//                       "hideFromSideBar": true,
//                       "options":[
//                                   {
//                                   "label":"in",
//                                   "value":"length.in",                                    
//                                   "UpdatedAt": "2024-06-22T10:28:06.344Z",
//                                       "UnitOffset": "0",
//                                       "DisplayPrecision": 3,
//                                       "IsDefault": true,
//                                       "CreatedAt": "2024-06-22T10:28:06.344Z",
//                                       "Id": 72,
//                                       "UnitFactor": "39.37007874015744",
//                                       "DimensionName": "length",
//                                       "UnitKey": "length.in",
//                                       "UnitName": "in",
//                                       "UnitLongName": "inches",
//                                       "SystemUnit": "English"
//                                   },
//                                   {
//                                   "label":"mm",
//                                   "value":"length.mm",                                      
//                                   "UpdatedAt": "2024-06-22T10:28:06.344Z",
//                                       "UnitOffset": "0",
//                                       "DisplayPrecision": 3,
//                                       "IsDefault": false,
//                                       "CreatedAt": "2024-06-22T10:28:06.344Z",
//                                       "Id": 74,
//                                       "UnitFactor": "1000",
//                                       "DimensionName": "length",
//                                       "UnitKey": "length.mm",
//                                       "UnitName": "mm",
//                                       "UnitLongName": "millimeters",
//                                       "SystemUnit": "Metric"
//                                   },
//                                   {
//                                   "label":"ft",
//                                   "value":"length.ft",                                      
//                                   "UpdatedAt": "2024-06-22T10:28:06.343Z",
//                                       "UnitOffset": "0",
//                                       "DisplayPrecision": 3,
//                                       "IsDefault": true,
//                                       "CreatedAt": "2024-06-22T10:28:06.343Z",
//                                       "Id": 71,
//                                       "UnitFactor": "3.28083989501312",
//                                       "DimensionName": "length",
//                                       "UnitKey": "length.ft",
//                                       "UnitName": "ft",
//                                       "UnitLongName": "feet",
//                                       "SystemUnit": "English"
//                                   },
//                                   {
//                                   "label":"cm",
//                                   "value":"length.cm",                                      
//                                   "UpdatedAt": "2024-06-22T10:28:06.343Z",
//                                       "UnitOffset": "0",
//                                       "DisplayPrecision": 3,
//                                       "IsDefault": true,
//                                       "CreatedAt": "2024-06-22T10:28:06.343Z",
//                                       "Id": 70,
//                                       "UnitFactor": "100",
//                                       "DimensionName": "length",
//                                       "UnitKey": "length.cm",
//                                       "UnitName": "cm",
//                                       "UnitLongName": "centimeters",
//                                       "SystemUnit": "Metric"
//                                   },
//                                   {
//                                   "label":"m",
//                                   "value":"length.m",  
//                                   "UpdatedAt": "2024-06-22T10:28:06.344Z",
//                                       "UnitOffset": "0",
//                                       "DisplayPrecision": 3,
//                                       "IsDefault": false,
//                                       "CreatedAt": "2024-06-22T10:28:06.344Z",
//                                       "Id": 73,
//                                       "UnitFactor": "1",
//                                       "DimensionName": "length",
//                                       "UnitKey": "length.m",
//                                       "UnitName": "m",
//                                       "UnitLongName": "meters",
//                                       "SystemUnit": "Metric"
//                                   }
//                               ],
//                       "dimensionName": [
//                           "length"
//                       ],
//                       "infoText": "Total Selected Area",
//                       "grid": "3",
//                       "style": null,
//                       "regex": "NOT_ALLOW_NEGATIVE",
//                       "uomFieldName": "LengthUOM",
//                       "defaultUOM": {
//                           "Metric": "length.in",
//                           "English": "length.in"
//                       },
//                       "defaultUOMValue": "length.in",
//                       "value": "14",
//                       "error": null,
//                       "uomValue": "length.in",
//                       "visibility": true,
//                       "fieldList": null,
//                       "funcExecResultFields": [],
//                       "focusedFieldName": ""
//                   }
// const iconFieldData = {
//               "fieldName": "NOTE",
//               "label": "Flowrate has been met",
//               "type": "icon",
//               "iconlocation": "data:image/jpeg;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAKnRFWHRDcmVhdGlvbiBUaW1lAE1pIDUgTXJ6IDIwMDMgMDE6MTY6MzYgKzAxMDAtSfIGAAAAB3RJTUUH0wMFDBUVe3K1WAAAAAlwSFlzAAAK8AAACvABQqw0mAAAAARnQU1BAACxjwv8YQUAAAY5SURBVHja7VdpbFRVFP7ue286a2emtGXa0tYyBbtZCnSBUiihYAHFkBYkwWKiRENCJFFBAkYBIyQ1oAiNUf8oSlxwIVETTYDwg9VoQDaJsZEECqXrtLNvb/G896YtBWNbRGOiNzm9b+7cd77vfPecc6fAf32wu3np9D4YfdfxsijiMUVGCjicttuwuXYDzv8jBH7Ygy/hKGnMr9kIg9GCztav0Xp8vz8zFVXT1uGXsfjixgr+23toiHGmhuJFuyEYrZCkGFyFSzCpZmWy14+WsfobE4GOj2C+1oldebPWs3jMC0n0QZEDiId7kFE0H4opef7ZFjT8bQQ6vXjBke122zMqgXg/gUegKGFACUGKeXB/7Sp2gwiefAXme06g/QPc54tgY+6MZyHGeiArEQJWLQoFEVLDD2t6JtLy3e6YCc/fcwK9UexML5hvFUxOAo2BEzh62QtO7gLHieQpDolUmVxTD38Qm75vRvZo/Aqj2dT2KeraPVheUNIERQpC9F2C0vYOrlyXEZeBqYW0yVWPmLkAvBHIq5hq6zp/7jVabRrJ94hleGUPhJsKzuZUPllqz6wi6YMInNmABzc50dZrh9VsRkYaj9MtlyFlPwqJM4JPknHqw8/kFJM4d+Z6nPhLRxBOxlqzM73UnjMbIoEjdBHHLpEq3Va4xvFIdTJERDO+ODkeyewyFBYmlQIoqJvK3ejGm6ceB3/XBK4dQHq/F1uzKtZQkvUDchS83IveAA+jkYcgCJqZjAKpkQxm8JGkEcgIwOV2IiXbNt07GavvmkB/P3Y4J5aPM9omQBGp3Mg5BANFroCnWQU3GAzgeAFZGXE6UAGMhYhEmCrFhymLJzK/D9vPbINzzASuHkC5P4zVWVOaKLu9OrhacklOVBbLYFzSoAKMGTGjtA8RzkYew/Qd7eVCsDgkuGc4xreL2DomAgrF0tqFvRllDTx5owU1+phGQuTscBcBaXZG0eskjAYeJdP8iMoW2k4KqCQoF2QxgOIFNsQkrD3WjKJRE/jxfawyJ9mq0/IXUvQBWokPmdp8jBPw0Bw/VYSBqCZhdoUHlAj0HNWiZ3xEI6GqwZGVPWxO8vRi96gIXNwLe6ADzXmVTzFRDCQiT4CzuKZGjMvFivoeSHISrZtQN6uLEjRFB+d0cE4lwZMKcgj5M+MwpKL+yBYsHZFAUMFLztzCLFtqEfX68C3Ri9rMWIT2ZKJqThhWC4eYaEL9vDaE4lYCDmoEOD6qgaskOIGOTRJRvQrsZg92fbwFxlvxhtXoz2+jwOPFvsKFmwXtoiEDoroKLKY9M6YrYjZ6qQf0ITc3gpp5PYiEHUPgnEpAbdcSGYFQu7OkAD4PxsWvI3jg1FBzGtYJj+/Et6nFixdnPbCUbrdeuulCtBrWjYW1EtNmFUCIwum4QN6jCIZcRJYAVQU06VVwmcholUnrNBOSQtm9fx18qU4ULdmB9mFHcL4Fj8QVw6LsKSsIPESVINFqwphETMXEZ1GLjLVdQsfRPnhOhGDtu6FHLtAR8XF61sF5Mo1EIkx1Lm+kHPOieVgOnKTfeFc78Eb+3LVMEsXEmUvDjemmOkTXr/jmkA9FTxeibE0VvjuaAovYpx0T44hcInL1qrv9simpoz82NH3yHKoHCXS34pmUnLxJqTk1kCVVdnnIGDUdjYSsEVE4GTalE3sOuuBKMyAz3YC3viqh0iRynKTJrRrP6Q3lj0btE+A8fXh1kAAl6cqJFU3UPkOJtwZMHmaMyNBNA95mQu10EdG4hZqMBeWlPiAJ2vcD0SsYkv72kVmgHc9sIPF7gJIjzeLMoVkcDswUil7RZlUJjQTlQNDixutbzqH6sAKOumHjsjaIsnrgkgbK3ZHedw5ZUnv7gAIyzvZc+4nuGRM5YGDa27oKup9bVCG2InW/gLkYy5dJaFzeR0WarPrQurb2wgiX/MXD2r6Dgwo4bNh64dC7C6jek12TyrRlHoksoieW0JXRwTLyrkrMKBsjBjt95ukHSIhuR0VPvD+PGhcO0T82n+OKWcCLw4Q6sg1l3X5KDAk1tMgrA1FQZLKib5QHmoei1wYJopDTuCaMuk9OHGDi1EgVkZ5lRRdOXeunWI447NjetBc9+H/8G8bvWyiEPl+STWMAAAAASUVORK5CYII=",
//               "disabled": false,
//               "hideFromSideBar": true,
//               "visible": true,
//               "grid": 4,
//             }

// const RequiredPressFlow = {
//                       "fieldName": "RequiredPressFlow",
//                       "label": "Required Pressure Flow",
//                       "type": "inputUom",
//                       "fieldDisplayOrder": 1,
//                       "isValidationRequired": true,
//                       "validateActionType": "both",
//                       "mandatory": false,
//                       "defaultValue": {
//                           "RequiredPressFlow": ""
//                       },
//                       "disabled": false,
//                       "disableUOM": true,
//                       "visible": true,
//                       "hideFromSideBar": true,
//                       "options": [
//                                   {
//                                       "label":"barg",
//                                       "value":"pressure.barg",
//                                       "UpdatedAt": "2024-06-22T10:28:06.366Z",
//                                       "UnitOffset": "0",
//                                       "DisplayPrecision": 3,
//                                       "IsDefault": true,
//                                       "CreatedAt": "2024-06-22T10:28:06.366Z",
//                                       "Id": 138,
//                                       "UnitFactor": "1",
//                                       "DimensionName": "pressure",
//                                       "UnitKey": "pressure.barg",
//                                       "UnitName": "barg",
//                                       "UnitLongName": "bars (gauge)",
//                                       "SystemUnit": "Metric"
//                                   },
//                                   {
//                                       "label":"in wc g",
//                                       "value":"pressure.inwcg",
//                                       "UpdatedAt": "2024-06-22T10:28:06.368Z",
//                                       "UnitOffset": "0",
//                                       "DisplayPrecision": 3,
//                                       "IsDefault": false,
//                                       "CreatedAt": "2024-06-22T10:28:06.368Z",
//                                       "Id": 141,
//                                       "UnitFactor": "401.4630759755619",
//                                       "DimensionName": "pressure",
//                                       "UnitKey": "pressure.inwcg",
//                                       "UnitName": "in wc g",
//                                       "UnitLongName": "inches water column, conventional (gauge)",
//                                       "SystemUnit": "English"
//                                   },
//                                   {
//                                       "label":"lb/ft² g",
//                                       "value":"pressure.lbft2g",
//                                       "UpdatedAt": "2024-06-22T10:28:06.369Z",
//                                       "UnitOffset": "0",
//                                       "DisplayPrecision": 3,
//                                       "IsDefault": false,
//                                       "CreatedAt": "2024-06-22T10:28:06.369Z",
//                                       "Id": 144,
//                                       "UnitFactor": "2088.5434233152523",
//                                       "DimensionName": "pressure",
//                                       "UnitKey": "pressure.lbft2g",
//                                       "UnitName": "lb/ft² g",
//                                       "UnitLongName": "pounds-force per square foot (gauge)",
//                                       "SystemUnit": "English"
//                                   },
//                                   {
//                                       "label":"mmH2O g",
//                                       "value":"pressure.mmh2og",
//                                       "UpdatedAt": "2024-06-22T10:28:06.370Z",
//                                       "UnitOffset": "0",
//                                       "DisplayPrecision": 3,
//                                       "IsDefault": false,
//                                       "CreatedAt": "2024-06-22T10:28:06.370Z",
//                                       "Id": 147,
//                                       "UnitFactor": "10197.162129779283",
//                                       "DimensionName": "pressure",
//                                       "UnitKey": "pressure.mmh2og",
//                                       "UnitName": "mmH2O g",
//                                       "UnitLongName": "millimeters of water, convnetional (gauge)",
//                                       "SystemUnit": "Metric"
//                                   },
//                                   {
//                                       "label":"oz/in² g",
//                                       "value":"pressure.osig",
//                                       "UpdatedAt": "2024-06-22T10:28:06.371Z",
//                                       "UnitOffset": "0",
//                                       "DisplayPrecision": 3,
//                                       "IsDefault": false,
//                                       "CreatedAt": "2024-06-22T10:28:06.371Z",
//                                       "Id": 150,
//                                       "UnitFactor": "232.06038036836134",
//                                       "DimensionName": "pressure",
//                                       "UnitKey": "pressure.osig",
//                                       "UnitName": "oz/in² g",
//                                       "UnitLongName": "ounces per square inch (gauge)",
//                                       "SystemUnit": "English"
//                                   },
//                                   {
//                                       "label":"Torr g",
//                                       "value":"pressure.torrg",
//                                       "UpdatedAt": "2024-06-22T10:28:06.372Z",
//                                       "UnitOffset": "0",
//                                       "DisplayPrecision": 3,
//                                       "IsDefault": false,
//                                       "CreatedAt": "2024-06-22T10:28:06.372Z",
//                                       "Id": 153,
//                                       "UnitFactor": "750.0616827041698",
//                                       "DimensionName": "pressure",
//                                       "UnitKey": "pressure.torrg",
//                                       "UnitName": "Torr g",
//                                       "UnitLongName": "Torrs (gauge)",
//                                       "SystemUnit": "English"
//                                   },
//                                   {
//                                       "label":"in Hg g",
//                                       "value":"pressure.inhgg",
//                                       "UpdatedAt": "2024-06-22T10:28:06.368Z",
//                                       "UnitOffset": "0",
//                                       "DisplayPrecision": 3,
//                                       "IsDefault": false,
//                                       "CreatedAt": "2024-06-22T10:28:06.368Z",
//                                       "Id": 140,
//                                       "UnitFactor": "29.52998715831217",
//                                       "DimensionName": "pressure",
//                                       "UnitKey": "pressure.inhgg",
//                                       "UnitName": "in Hg g",
//                                       "UnitLongName": "inches of mercury, conventional (gauge)",
//                                       "SystemUnit": "English"
//                                   },
//                                   {
//                                       "label":"kPa g",
//                                       "value":"pressure.kpascalg",
//                                       "UpdatedAt": "2024-06-22T10:28:06.369Z",
//                                       "UnitOffset": "0",
//                                       "DisplayPrecision": 3,
//                                       "IsDefault": false,
//                                       "CreatedAt": "2024-06-22T10:28:06.369Z",
//                                       "Id": 143,
//                                       "UnitFactor": "100",
//                                       "DimensionName": "pressure",
//                                       "UnitKey": "pressure.kpascalg",
//                                       "UnitName": "kPa g",
//                                       "UnitLongName": "kilopascals (gauge)",
//                                       "SystemUnit": "Metric"
//                                   },
//                                   {
//                                       "label":"meter H2O g",
//                                       "value":"pressure.meterh2og",
//                                       "UpdatedAt": "2024-06-22T10:28:06.369Z",
//                                       "UnitOffset": "0",
//                                       "DisplayPrecision": 3,
//                                       "IsDefault": false,
//                                       "CreatedAt": "2024-06-22T10:28:06.369Z",
//                                       "Id": 146,
//                                       "UnitFactor": "10.197162129779283",
//                                       "DimensionName": "pressure",
//                                       "UnitKey": "pressure.meterh2og",
//                                       "UnitName": "meter H2O g",
//                                       "UnitLongName": "meters of water, conventional (gauge)",
//                                       "SystemUnit": "Metric"
//                                   },
//                                   {
//                                       "label":"MPa g",
//                                       "value":"pressure.Mpascalg",
//                                       "UpdatedAt": "2024-06-22T10:28:06.371Z",
//                                       "UnitOffset": "0",
//                                       "DisplayPrecision": 3,
//                                       "IsDefault": false,
//                                       "CreatedAt": "2024-06-22T10:28:06.371Z",
//                                       "Id": 149,
//                                       "UnitFactor": "0.1",
//                                       "DimensionName": "pressure",
//                                       "UnitKey": "pressure.Mpascalg",
//                                       "UnitName": "MPa g",
//                                       "UnitLongName": "megapascals (gauge)",
//                                       "SystemUnit": "Metric"
//                                   },
//                                   {
//                                       "label":"psig",
//                                       "value":"pressure.psig",
//                                       "UpdatedAt": "2024-06-22T10:28:06.371Z",
//                                       "UnitOffset": "0",
//                                       "DisplayPrecision": 3,
//                                       "IsDefault": true,
//                                       "CreatedAt": "2024-06-22T10:28:06.371Z",
//                                       "Id": 152,
//                                       "UnitFactor": "14.503773773022584",
//                                       "DimensionName": "pressure",
//                                       "UnitKey": "pressure.psig",
//                                       "UnitName": "psig",
//                                       "UnitLongName": "pounds per square inch (gauge)",
//                                       "SystemUnit": "English"
//                                   },
//                                   {
//                                       "label":"atm g",
//                                       "value":"pressure.atm",
//                                       "UpdatedAt": "2024-06-22T10:28:06.365Z",
//                                       "UnitOffset": "0",
//                                       "DisplayPrecision": 3,
//                                       "IsDefault": false,
//                                       "CreatedAt": "2024-06-22T10:28:06.365Z",
//                                       "Id": 137,
//                                       "UnitFactor": "0.9869232667160128",
//                                       "DimensionName": "pressure",
//                                       "UnitKey": "pressure.atm",
//                                       "UnitName": "atm g",
//                                       "UnitLongName": "atmospheres (gauge)",
//                                       "SystemUnit": "English"
//                                   },
//                                   {
//                                       "label":"ft wc g",
//                                       "value":"pressure.ftwca",
//                                       "UpdatedAt": "2024-06-22T10:28:06.367Z",
//                                       "UnitOffset": "0",
//                                       "DisplayPrecision": 3,
//                                       "IsDefault": false,
//                                       "CreatedAt": "2024-06-22T10:28:06.367Z",
//                                       "Id": 139,
//                                       "UnitFactor": "33.45525633129682",
//                                       "DimensionName": "pressure",
//                                       "UnitKey": "pressure.ftwca",
//                                       "UnitName": "ft wc g",
//                                       "UnitLongName": "feet of water column, conventional (gauge)",
//                                       "SystemUnit": "English"
//                                   },
//                                   {
//                                       "label":"kg/cm² g",
//                                       "value":"pressure.kgcm2g",
//                                       "UpdatedAt": "2024-06-22T10:28:06.368Z",
//                                       "UnitOffset": "0",
//                                       "DisplayPrecision": 3,
//                                       "IsDefault": false,
//                                       "CreatedAt": "2024-06-22T10:28:06.368Z",
//                                       "Id": 142,
//                                       "UnitFactor": "1.0197162129779282",
//                                       "DimensionName": "pressure",
//                                       "UnitKey": "pressure.kgcm2g",
//                                       "UnitName": "kg/cm² g",
//                                       "UnitLongName": "kilograms-force per square centimeter (gauge)",
//                                       "SystemUnit": "Metric"
//                                   },
//                                   {
//                                       "label":"mbarg",
//                                       "value":"pressure.mbarg",
//                                       "UpdatedAt": "2024-06-22T10:28:06.369Z",
//                                       "UnitOffset": "0",
//                                       "DisplayPrecision": 3,
//                                       "IsDefault": false,
//                                       "CreatedAt": "2024-06-22T10:28:06.369Z",
//                                       "Id": 145,
//                                       "UnitFactor": "1000",
//                                       "DimensionName": "pressure",
//                                       "UnitKey": "pressure.mbarg",
//                                       "UnitName": "mbarg",
//                                       "UnitLongName": "millibars (gauge)",
//                                       "SystemUnit": "Metric"
//                                   },
//                                   {
//                                       "label":"mmHg g",
//                                       "value":"pressure.mmhgg",
//                                       "UpdatedAt": "2024-06-22T10:28:06.370Z",
//                                       "UnitOffset": "0",
//                                       "DisplayPrecision": 3,
//                                       "IsDefault": false,
//                                       "CreatedAt": "2024-06-22T10:28:06.370Z",
//                                       "Id": 148,
//                                       "UnitFactor": "750.06167382113",
//                                       "DimensionName": "pressure",
//                                       "UnitKey": "pressure.mmhgg",
//                                       "UnitName": "mmHg g",
//                                       "UnitLongName": "millimeters of mercury, conventional (gauge)",
//                                       "SystemUnit": "Metric"
//                                   },
//                                   {
//                                       "label":"Pa g",
//                                       "value":"pressure.pascalg",
//                                       "UpdatedAt": "2024-06-22T10:28:06.371Z",
//                                       "UnitOffset": "0",
//                                       "DisplayPrecision": 3,
//                                       "IsDefault": false,
//                                       "CreatedAt": "2024-06-22T10:28:06.371Z",
//                                       "Id": 151,
//                                       "UnitFactor": "100000",
//                                       "DimensionName": "pressure",
//                                       "UnitKey": "pressure.pascalg",
//                                       "UnitName": "Pa g",
//                                       "UnitLongName": "pascals (gauge)",
//                                       "SystemUnit": "Metric"
//                                   }
//                               ],
//                       "dimensionName": [
//                           "pressure"
//                       ],
//                       "infoText": "Required Pressure Flow",
//                       "grid": "3",
//                       "style": null,
//                       "regex": "NOT_ALLOW_NEGATIVE",
//                       "uomFieldName": "PressureUOM",
//                       "defaultUOM": {
//                           "Metric": "pressure.mmhgg",
//                           "English": "pressure.psig"
//                       },
//                       "defaultUOMValue": "pressure.psig",
//                       "UomFieldName": "PressureUOM",
//                       "value": "14",
//                       "error": null,
//                       "uomValue": "pressure.psig",
//                       "visibility": true,
//                       "fieldList": null,
//                       "funcExecResultFields": [],
//                       "focusedFieldName": ""
//                   }

// const RetedPressFlow = {
//                       "fieldName": "RetedPressFlow",
//                       "label": "Total Rated Pressure Valve Flow",
//                       "type": "inputUom",
//                       "fieldDisplayOrder": 1,
//                       "isValidationRequired": true,
//                       "validateActionType": "both",
//                       "mandatory": false,
//                       "defaultValue": {
//                           "RequiredPressFlow": "4"
//                       },
//                       "disabled": false,
//                       "disableUOM": true,
//                       "visible": true,
//                       "hideFromSideBar": true,
//                       "options": [
//                                   {
//                                       "label":"barg",
//                                       "value":"pressure.barg",
//                                       "UpdatedAt": "2024-06-22T10:28:06.366Z",
//                                       "UnitOffset": "0",
//                                       "DisplayPrecision": 3,
//                                       "IsDefault": true,
//                                       "CreatedAt": "2024-06-22T10:28:06.366Z",
//                                       "Id": 138,
//                                       "UnitFactor": "1",
//                                       "DimensionName": "pressure",
//                                       "UnitKey": "pressure.barg",
//                                       "UnitName": "barg",
//                                       "UnitLongName": "bars (gauge)",
//                                       "SystemUnit": "Metric"
//                                   },
//                                   {
//                                       "label":"in wc g",
//                                       "value":"pressure.inwcg",
//                                       "UpdatedAt": "2024-06-22T10:28:06.368Z",
//                                       "UnitOffset": "0",
//                                       "DisplayPrecision": 3,
//                                       "IsDefault": false,
//                                       "CreatedAt": "2024-06-22T10:28:06.368Z",
//                                       "Id": 141,
//                                       "UnitFactor": "401.4630759755619",
//                                       "DimensionName": "pressure",
//                                       "UnitKey": "pressure.inwcg",
//                                       "UnitName": "in wc g",
//                                       "UnitLongName": "inches water column, conventional (gauge)",
//                                       "SystemUnit": "English"
//                                   },
//                                   {
//                                       "label":"lb/ft² g",
//                                       "value":"pressure.lbft2g",
//                                       "UpdatedAt": "2024-06-22T10:28:06.369Z",
//                                       "UnitOffset": "0",
//                                       "DisplayPrecision": 3,
//                                       "IsDefault": false,
//                                       "CreatedAt": "2024-06-22T10:28:06.369Z",
//                                       "Id": 144,
//                                       "UnitFactor": "2088.5434233152523",
//                                       "DimensionName": "pressure",
//                                       "UnitKey": "pressure.lbft2g",
//                                       "UnitName": "lb/ft² g",
//                                       "UnitLongName": "pounds-force per square foot (gauge)",
//                                       "SystemUnit": "English"
//                                   },
//                                   {
//                                       "label":"mmH2O g",
//                                       "value":"pressure.mmh2og",
//                                       "UpdatedAt": "2024-06-22T10:28:06.370Z",
//                                       "UnitOffset": "0",
//                                       "DisplayPrecision": 3,
//                                       "IsDefault": false,
//                                       "CreatedAt": "2024-06-22T10:28:06.370Z",
//                                       "Id": 147,
//                                       "UnitFactor": "10197.162129779283",
//                                       "DimensionName": "pressure",
//                                       "UnitKey": "pressure.mmh2og",
//                                       "UnitName": "mmH2O g",
//                                       "UnitLongName": "millimeters of water, convnetional (gauge)",
//                                       "SystemUnit": "Metric"
//                                   },
//                                   {
//                                       "label":"oz/in² g",
//                                       "value":"pressure.osig",
//                                       "UpdatedAt": "2024-06-22T10:28:06.371Z",
//                                       "UnitOffset": "0",
//                                       "DisplayPrecision": 3,
//                                       "IsDefault": false,
//                                       "CreatedAt": "2024-06-22T10:28:06.371Z",
//                                       "Id": 150,
//                                       "UnitFactor": "232.06038036836134",
//                                       "DimensionName": "pressure",
//                                       "UnitKey": "pressure.osig",
//                                       "UnitName": "oz/in² g",
//                                       "UnitLongName": "ounces per square inch (gauge)",
//                                       "SystemUnit": "English"
//                                   },
//                                   {
//                                       "label":"Torr g",
//                                       "value":"pressure.torrg",
//                                       "UpdatedAt": "2024-06-22T10:28:06.372Z",
//                                       "UnitOffset": "0",
//                                       "DisplayPrecision": 3,
//                                       "IsDefault": false,
//                                       "CreatedAt": "2024-06-22T10:28:06.372Z",
//                                       "Id": 153,
//                                       "UnitFactor": "750.0616827041698",
//                                       "DimensionName": "pressure",
//                                       "UnitKey": "pressure.torrg",
//                                       "UnitName": "Torr g",
//                                       "UnitLongName": "Torrs (gauge)",
//                                       "SystemUnit": "English"
//                                   },
//                                   {
//                                       "label":"in Hg g",
//                                       "value":"pressure.inhgg",
//                                       "UpdatedAt": "2024-06-22T10:28:06.368Z",
//                                       "UnitOffset": "0",
//                                       "DisplayPrecision": 3,
//                                       "IsDefault": false,
//                                       "CreatedAt": "2024-06-22T10:28:06.368Z",
//                                       "Id": 140,
//                                       "UnitFactor": "29.52998715831217",
//                                       "DimensionName": "pressure",
//                                       "UnitKey": "pressure.inhgg",
//                                       "UnitName": "in Hg g",
//                                       "UnitLongName": "inches of mercury, conventional (gauge)",
//                                       "SystemUnit": "English"
//                                   },
//                                   {
//                                       "label":"kPa g",
//                                       "value":"pressure.kpascalg",
//                                       "UpdatedAt": "2024-06-22T10:28:06.369Z",
//                                       "UnitOffset": "0",
//                                       "DisplayPrecision": 3,
//                                       "IsDefault": false,
//                                       "CreatedAt": "2024-06-22T10:28:06.369Z",
//                                       "Id": 143,
//                                       "UnitFactor": "100",
//                                       "DimensionName": "pressure",
//                                       "UnitKey": "pressure.kpascalg",
//                                       "UnitName": "kPa g",
//                                       "UnitLongName": "kilopascals (gauge)",
//                                       "SystemUnit": "Metric"
//                                   },
//                                   {
//                                       "label":"meter H2O g",
//                                       "value":"pressure.meterh2og",
//                                       "UpdatedAt": "2024-06-22T10:28:06.369Z",
//                                       "UnitOffset": "0",
//                                       "DisplayPrecision": 3,
//                                       "IsDefault": false,
//                                       "CreatedAt": "2024-06-22T10:28:06.369Z",
//                                       "Id": 146,
//                                       "UnitFactor": "10.197162129779283",
//                                       "DimensionName": "pressure",
//                                       "UnitKey": "pressure.meterh2og",
//                                       "UnitName": "meter H2O g",
//                                       "UnitLongName": "meters of water, conventional (gauge)",
//                                       "SystemUnit": "Metric"
//                                   },
//                                   {
//                                       "label":"MPa g",
//                                       "value":"pressure.Mpascalg",
//                                       "UpdatedAt": "2024-06-22T10:28:06.371Z",
//                                       "UnitOffset": "0",
//                                       "DisplayPrecision": 3,
//                                       "IsDefault": false,
//                                       "CreatedAt": "2024-06-22T10:28:06.371Z",
//                                       "Id": 149,
//                                       "UnitFactor": "0.1",
//                                       "DimensionName": "pressure",
//                                       "UnitKey": "pressure.Mpascalg",
//                                       "UnitName": "MPa g",
//                                       "UnitLongName": "megapascals (gauge)",
//                                       "SystemUnit": "Metric"
//                                   },
//                                   {
//                                       "label":"psig",
//                                       "value":"pressure.psig",
//                                       "UpdatedAt": "2024-06-22T10:28:06.371Z",
//                                       "UnitOffset": "0",
//                                       "DisplayPrecision": 3,
//                                       "IsDefault": true,
//                                       "CreatedAt": "2024-06-22T10:28:06.371Z",
//                                       "Id": 152,
//                                       "UnitFactor": "14.503773773022584",
//                                       "DimensionName": "pressure",
//                                       "UnitKey": "pressure.psig",
//                                       "UnitName": "psig",
//                                       "UnitLongName": "pounds per square inch (gauge)",
//                                       "SystemUnit": "English"
//                                   },
//                                   {
//                                       "label":"atm g",
//                                       "value":"pressure.atm",
//                                       "UpdatedAt": "2024-06-22T10:28:06.365Z",
//                                       "UnitOffset": "0",
//                                       "DisplayPrecision": 3,
//                                       "IsDefault": false,
//                                       "CreatedAt": "2024-06-22T10:28:06.365Z",
//                                       "Id": 137,
//                                       "UnitFactor": "0.9869232667160128",
//                                       "DimensionName": "pressure",
//                                       "UnitKey": "pressure.atm",
//                                       "UnitName": "atm g",
//                                       "UnitLongName": "atmospheres (gauge)",
//                                       "SystemUnit": "English"
//                                   },
//                                   {
//                                       "label":"ft wc g",
//                                       "value":"pressure.ftwca",
//                                       "UpdatedAt": "2024-06-22T10:28:06.367Z",
//                                       "UnitOffset": "0",
//                                       "DisplayPrecision": 3,
//                                       "IsDefault": false,
//                                       "CreatedAt": "2024-06-22T10:28:06.367Z",
//                                       "Id": 139,
//                                       "UnitFactor": "33.45525633129682",
//                                       "DimensionName": "pressure",
//                                       "UnitKey": "pressure.ftwca",
//                                       "UnitName": "ft wc g",
//                                       "UnitLongName": "feet of water column, conventional (gauge)",
//                                       "SystemUnit": "English"
//                                   },
//                                   {
//                                       "label":"kg/cm² g",
//                                       "value":"pressure.kgcm2g",
//                                       "UpdatedAt": "2024-06-22T10:28:06.368Z",
//                                       "UnitOffset": "0",
//                                       "DisplayPrecision": 3,
//                                       "IsDefault": false,
//                                       "CreatedAt": "2024-06-22T10:28:06.368Z",
//                                       "Id": 142,
//                                       "UnitFactor": "1.0197162129779282",
//                                       "DimensionName": "pressure",
//                                       "UnitKey": "pressure.kgcm2g",
//                                       "UnitName": "kg/cm² g",
//                                       "UnitLongName": "kilograms-force per square centimeter (gauge)",
//                                       "SystemUnit": "Metric"
//                                   },
//                                   {
//                                       "label":"mbarg",
//                                       "value":"pressure.mbarg",
//                                       "UpdatedAt": "2024-06-22T10:28:06.369Z",
//                                       "UnitOffset": "0",
//                                       "DisplayPrecision": 3,
//                                       "IsDefault": false,
//                                       "CreatedAt": "2024-06-22T10:28:06.369Z",
//                                       "Id": 145,
//                                       "UnitFactor": "1000",
//                                       "DimensionName": "pressure",
//                                       "UnitKey": "pressure.mbarg",
//                                       "UnitName": "mbarg",
//                                       "UnitLongName": "millibars (gauge)",
//                                       "SystemUnit": "Metric"
//                                   },
//                                   {
//                                       "label":"mmHg g",
//                                       "value":"pressure.mmhgg",
//                                       "UpdatedAt": "2024-06-22T10:28:06.370Z",
//                                       "UnitOffset": "0",
//                                       "DisplayPrecision": 3,
//                                       "IsDefault": false,
//                                       "CreatedAt": "2024-06-22T10:28:06.370Z",
//                                       "Id": 148,
//                                       "UnitFactor": "750.06167382113",
//                                       "DimensionName": "pressure",
//                                       "UnitKey": "pressure.mmhgg",
//                                       "UnitName": "mmHg g",
//                                       "UnitLongName": "millimeters of mercury, conventional (gauge)",
//                                       "SystemUnit": "Metric"
//                                   },
//                                   {
//                                       "label":"Pa g",
//                                       "value":"pressure.pascalg",
//                                       "UpdatedAt": "2024-06-22T10:28:06.371Z",
//                                       "UnitOffset": "0",
//                                       "DisplayPrecision": 3,
//                                       "IsDefault": false,
//                                       "CreatedAt": "2024-06-22T10:28:06.371Z",
//                                       "Id": 151,
//                                       "UnitFactor": "100000",
//                                       "DimensionName": "pressure",
//                                       "UnitKey": "pressure.pascalg",
//                                       "UnitName": "Pa g",
//                                       "UnitLongName": "pascals (gauge)",
//                                       "SystemUnit": "Metric"
//                                   }
//                               ],
//                       "dimensionName": [
//                           "pressure"
//                       ],
//                       "infoText": "Total Rated Pressure Valve Flow",
//                       "grid": "3",
//                       "style": null,
//                       "regex": "NOT_ALLOW_NEGATIVE",
//                       "uomFieldName": "PressureUOM",
//                       "defaultUOM": {
//                           "Metric": "pressure.mmhgg",
//                           "English": "pressure.psig"
//                       },
//                       "defaultUOMValue": "pressure.psig",
//                       "UomFieldName": "PressureUOM",
//                       "value": "14",
//                       "error": null,
//                       "uomValue": "pressure.psig",
//                       "visibility": true,
//                       "fieldList": null,
//                       "funcExecResultFields": [],
//                       "focusedFieldName": ""
//                   }

// const TotalSelectedField = {
//                 "fieldName": "totalSelected",
//                 "label": "Total Selected %",
//                 "type": "number",
//                 "mandatory":true,
//                 "defaultValue": "",
//                 "disabled": false,
//                 "visible": true,
//                 "infoText": "Pressure Compressibility Factor",                
//                 "regex": "NOT_ALLOW_NEGATIVE"
//             }

// const ActualPressFlow = {
//                       "fieldName": "ActualPressFlow",
//                       "label": "Total Actual Pressure Valve Flow",
//                       "type": "inputUom",
//                       "fieldDisplayOrder": 1,
//                       "isValidationRequired": true,
//                       "validateActionType": "both",
//                       "mandatory": false,
//                       "defaultValue": {
//                           "ActualPressFlow": ""
//                       },
//                       "disabled": false,
//                       "disableUOM": true,
//                       "visible": true,
//                       "hideFromSideBar": true,
//                       "options": [
//                                   {
//                                       "label":"barg",
//                                       "value":"pressure.barg",
//                                       "UpdatedAt": "2024-06-22T10:28:06.366Z",
//                                       "UnitOffset": "0",
//                                       "DisplayPrecision": 3,
//                                       "IsDefault": true,
//                                       "CreatedAt": "2024-06-22T10:28:06.366Z",
//                                       "Id": 138,
//                                       "UnitFactor": "1",
//                                       "DimensionName": "pressure",
//                                       "UnitKey": "pressure.barg",
//                                       "UnitName": "barg",
//                                       "UnitLongName": "bars (gauge)",
//                                       "SystemUnit": "Metric"
//                                   },
//                                   {
//                                       "label":"in wc g",
//                                       "value":"pressure.inwcg",
//                                       "UpdatedAt": "2024-06-22T10:28:06.368Z",
//                                       "UnitOffset": "0",
//                                       "DisplayPrecision": 3,
//                                       "IsDefault": false,
//                                       "CreatedAt": "2024-06-22T10:28:06.368Z",
//                                       "Id": 141,
//                                       "UnitFactor": "401.4630759755619",
//                                       "DimensionName": "pressure",
//                                       "UnitKey": "pressure.inwcg",
//                                       "UnitName": "in wc g",
//                                       "UnitLongName": "inches water column, conventional (gauge)",
//                                       "SystemUnit": "English"
//                                   },
//                                   {
//                                       "label":"lb/ft² g",
//                                       "value":"pressure.lbft2g",
//                                       "UpdatedAt": "2024-06-22T10:28:06.369Z",
//                                       "UnitOffset": "0",
//                                       "DisplayPrecision": 3,
//                                       "IsDefault": false,
//                                       "CreatedAt": "2024-06-22T10:28:06.369Z",
//                                       "Id": 144,
//                                       "UnitFactor": "2088.5434233152523",
//                                       "DimensionName": "pressure",
//                                       "UnitKey": "pressure.lbft2g",
//                                       "UnitName": "lb/ft² g",
//                                       "UnitLongName": "pounds-force per square foot (gauge)",
//                                       "SystemUnit": "English"
//                                   },
//                                   {
//                                       "label":"mmH2O g",
//                                       "value":"pressure.mmh2og",
//                                       "UpdatedAt": "2024-06-22T10:28:06.370Z",
//                                       "UnitOffset": "0",
//                                       "DisplayPrecision": 3,
//                                       "IsDefault": false,
//                                       "CreatedAt": "2024-06-22T10:28:06.370Z",
//                                       "Id": 147,
//                                       "UnitFactor": "10197.162129779283",
//                                       "DimensionName": "pressure",
//                                       "UnitKey": "pressure.mmh2og",
//                                       "UnitName": "mmH2O g",
//                                       "UnitLongName": "millimeters of water, convnetional (gauge)",
//                                       "SystemUnit": "Metric"
//                                   },
//                                   {
//                                       "label":"oz/in² g",
//                                       "value":"pressure.osig",
//                                       "UpdatedAt": "2024-06-22T10:28:06.371Z",
//                                       "UnitOffset": "0",
//                                       "DisplayPrecision": 3,
//                                       "IsDefault": false,
//                                       "CreatedAt": "2024-06-22T10:28:06.371Z",
//                                       "Id": 150,
//                                       "UnitFactor": "232.06038036836134",
//                                       "DimensionName": "pressure",
//                                       "UnitKey": "pressure.osig",
//                                       "UnitName": "oz/in² g",
//                                       "UnitLongName": "ounces per square inch (gauge)",
//                                       "SystemUnit": "English"
//                                   },
//                                   {
//                                       "label":"Torr g",
//                                       "value":"pressure.torrg",
//                                       "UpdatedAt": "2024-06-22T10:28:06.372Z",
//                                       "UnitOffset": "0",
//                                       "DisplayPrecision": 3,
//                                       "IsDefault": false,
//                                       "CreatedAt": "2024-06-22T10:28:06.372Z",
//                                       "Id": 153,
//                                       "UnitFactor": "750.0616827041698",
//                                       "DimensionName": "pressure",
//                                       "UnitKey": "pressure.torrg",
//                                       "UnitName": "Torr g",
//                                       "UnitLongName": "Torrs (gauge)",
//                                       "SystemUnit": "English"
//                                   },
//                                   {
//                                       "label":"in Hg g",
//                                       "value":"pressure.inhgg",
//                                       "UpdatedAt": "2024-06-22T10:28:06.368Z",
//                                       "UnitOffset": "0",
//                                       "DisplayPrecision": 3,
//                                       "IsDefault": false,
//                                       "CreatedAt": "2024-06-22T10:28:06.368Z",
//                                       "Id": 140,
//                                       "UnitFactor": "29.52998715831217",
//                                       "DimensionName": "pressure",
//                                       "UnitKey": "pressure.inhgg",
//                                       "UnitName": "in Hg g",
//                                       "UnitLongName": "inches of mercury, conventional (gauge)",
//                                       "SystemUnit": "English"
//                                   },
//                                   {
//                                       "label":"kPa g",
//                                       "value":"pressure.kpascalg",
//                                       "UpdatedAt": "2024-06-22T10:28:06.369Z",
//                                       "UnitOffset": "0",
//                                       "DisplayPrecision": 3,
//                                       "IsDefault": false,
//                                       "CreatedAt": "2024-06-22T10:28:06.369Z",
//                                       "Id": 143,
//                                       "UnitFactor": "100",
//                                       "DimensionName": "pressure",
//                                       "UnitKey": "pressure.kpascalg",
//                                       "UnitName": "kPa g",
//                                       "UnitLongName": "kilopascals (gauge)",
//                                       "SystemUnit": "Metric"
//                                   },
//                                   {
//                                       "label":"meter H2O g",
//                                       "value":"pressure.meterh2og",
//                                       "UpdatedAt": "2024-06-22T10:28:06.369Z",
//                                       "UnitOffset": "0",
//                                       "DisplayPrecision": 3,
//                                       "IsDefault": false,
//                                       "CreatedAt": "2024-06-22T10:28:06.369Z",
//                                       "Id": 146,
//                                       "UnitFactor": "10.197162129779283",
//                                       "DimensionName": "pressure",
//                                       "UnitKey": "pressure.meterh2og",
//                                       "UnitName": "meter H2O g",
//                                       "UnitLongName": "meters of water, conventional (gauge)",
//                                       "SystemUnit": "Metric"
//                                   },
//                                   {
//                                       "label":"MPa g",
//                                       "value":"pressure.Mpascalg",
//                                       "UpdatedAt": "2024-06-22T10:28:06.371Z",
//                                       "UnitOffset": "0",
//                                       "DisplayPrecision": 3,
//                                       "IsDefault": false,
//                                       "CreatedAt": "2024-06-22T10:28:06.371Z",
//                                       "Id": 149,
//                                       "UnitFactor": "0.1",
//                                       "DimensionName": "pressure",
//                                       "UnitKey": "pressure.Mpascalg",
//                                       "UnitName": "MPa g",
//                                       "UnitLongName": "megapascals (gauge)",
//                                       "SystemUnit": "Metric"
//                                   },
//                                   {
//                                       "label":"psig",
//                                       "value":"pressure.psig",
//                                       "UpdatedAt": "2024-06-22T10:28:06.371Z",
//                                       "UnitOffset": "0",
//                                       "DisplayPrecision": 3,
//                                       "IsDefault": true,
//                                       "CreatedAt": "2024-06-22T10:28:06.371Z",
//                                       "Id": 152,
//                                       "UnitFactor": "14.503773773022584",
//                                       "DimensionName": "pressure",
//                                       "UnitKey": "pressure.psig",
//                                       "UnitName": "psig",
//                                       "UnitLongName": "pounds per square inch (gauge)",
//                                       "SystemUnit": "English"
//                                   },
//                                   {
//                                       "label":"atm g",
//                                       "value":"pressure.atm",
//                                       "UpdatedAt": "2024-06-22T10:28:06.365Z",
//                                       "UnitOffset": "0",
//                                       "DisplayPrecision": 3,
//                                       "IsDefault": false,
//                                       "CreatedAt": "2024-06-22T10:28:06.365Z",
//                                       "Id": 137,
//                                       "UnitFactor": "0.9869232667160128",
//                                       "DimensionName": "pressure",
//                                       "UnitKey": "pressure.atm",
//                                       "UnitName": "atm g",
//                                       "UnitLongName": "atmospheres (gauge)",
//                                       "SystemUnit": "English"
//                                   },
//                                   {
//                                       "label":"ft wc g",
//                                       "value":"pressure.ftwca",
//                                       "UpdatedAt": "2024-06-22T10:28:06.367Z",
//                                       "UnitOffset": "0",
//                                       "DisplayPrecision": 3,
//                                       "IsDefault": false,
//                                       "CreatedAt": "2024-06-22T10:28:06.367Z",
//                                       "Id": 139,
//                                       "UnitFactor": "33.45525633129682",
//                                       "DimensionName": "pressure",
//                                       "UnitKey": "pressure.ftwca",
//                                       "UnitName": "ft wc g",
//                                       "UnitLongName": "feet of water column, conventional (gauge)",
//                                       "SystemUnit": "English"
//                                   },
//                                   {
//                                       "label":"kg/cm² g",
//                                       "value":"pressure.kgcm2g",
//                                       "UpdatedAt": "2024-06-22T10:28:06.368Z",
//                                       "UnitOffset": "0",
//                                       "DisplayPrecision": 3,
//                                       "IsDefault": false,
//                                       "CreatedAt": "2024-06-22T10:28:06.368Z",
//                                       "Id": 142,
//                                       "UnitFactor": "1.0197162129779282",
//                                       "DimensionName": "pressure",
//                                       "UnitKey": "pressure.kgcm2g",
//                                       "UnitName": "kg/cm² g",
//                                       "UnitLongName": "kilograms-force per square centimeter (gauge)",
//                                       "SystemUnit": "Metric"
//                                   },
//                                   {
//                                       "label":"mbarg",
//                                       "value":"pressure.mbarg",
//                                       "UpdatedAt": "2024-06-22T10:28:06.369Z",
//                                       "UnitOffset": "0",
//                                       "DisplayPrecision": 3,
//                                       "IsDefault": false,
//                                       "CreatedAt": "2024-06-22T10:28:06.369Z",
//                                       "Id": 145,
//                                       "UnitFactor": "1000",
//                                       "DimensionName": "pressure",
//                                       "UnitKey": "pressure.mbarg",
//                                       "UnitName": "mbarg",
//                                       "UnitLongName": "millibars (gauge)",
//                                       "SystemUnit": "Metric"
//                                   },
//                                   {
//                                       "label":"mmHg g",
//                                       "value":"pressure.mmhgg",
//                                       "UpdatedAt": "2024-06-22T10:28:06.370Z",
//                                       "UnitOffset": "0",
//                                       "DisplayPrecision": 3,
//                                       "IsDefault": false,
//                                       "CreatedAt": "2024-06-22T10:28:06.370Z",
//                                       "Id": 148,
//                                       "UnitFactor": "750.06167382113",
//                                       "DimensionName": "pressure",
//                                       "UnitKey": "pressure.mmhgg",
//                                       "UnitName": "mmHg g",
//                                       "UnitLongName": "millimeters of mercury, conventional (gauge)",
//                                       "SystemUnit": "Metric"
//                                   },
//                                   {
//                                       "label":"Pa g",
//                                       "value":"pressure.pascalg",
//                                       "UpdatedAt": "2024-06-22T10:28:06.371Z",
//                                       "UnitOffset": "0",
//                                       "DisplayPrecision": 3,
//                                       "IsDefault": false,
//                                       "CreatedAt": "2024-06-22T10:28:06.371Z",
//                                       "Id": 151,
//                                       "UnitFactor": "100000",
//                                       "DimensionName": "pressure",
//                                       "UnitKey": "pressure.pascalg",
//                                       "UnitName": "Pa g",
//                                       "UnitLongName": "pascals (gauge)",
//                                       "SystemUnit": "Metric"
//                                   }
//                               ],
//                       "dimensionName": [
//                           "pressure"
//                       ],
//                       "infoText": "Total Actual Pressure Valve Flow",
//                       "grid": "3",
//                       "style": null,
//                       "regex": "NOT_ALLOW_NEGATIVE",
//                       "uomFieldName": "PressureUOM",
//                       "defaultUOM": {
//                           "Metric": "pressure.mmhgg",
//                           "English": "pressure.psig"
//                       },
//                       "defaultUOMValue": "pressure.psig",
//                       "UomFieldName": "PressureUOM",
//                       "value": "14",
//                       "error": null,
//                       "uomValue": "pressure.psig",
//                       "visibility": true,
//                       "fieldList": null,
//                       "funcExecResultFields": [],
//                       "focusedFieldName": ""
//                   }
const MultivalveSection = (({multivalveData, selectedValvesHeader, MultiValveFieldSection, handleSelectedValveAction,handleMultiValveAction})=>{
    const { sizingData, payloadData, MultiValveSelectionData} = useSelector((state) => state.workflowPayload); 
    // const { error} = useSelector((state) => state.workflow); 
    const [multivalveColumn, setMultivalveColumn] = useState([])
    //const [multiRecord, setmultiRecord] = useState([...props.multivalveData]);
    const [customOptions, setCustomOptions] = useState({
            rowsPerPageOptions: [10, 25, 50, 100],
            selectableRows: "none",
    });
    useEffect(()=>{
        // console.log('MultiValveFieldSection .......... ',multivalveData.length);
        if(multivalveData?.length>0){
            
            if(selectedValvesHeader?.length>0){
                const localcolumns= selectedValvesHeader.map((item)=>{
                    if(item.type === 'button'){
                        return {
                            ...item,
                            options: {
                                        customBodyRender: (value, tableMeta) => {
                                        const rowIndex = tableMeta.rowIndex;
                                        return (<>
                                            {rowIndex === 0 ?
                                            <button
                                            type="button"
                                            style={{
                                                width: "5rem",
                                                padding: "0.25rem 0.35rem",
                                                border: "1px solid #706c6c",
                                                borderRadius: "0.25rem",
                                                backgroundColor: "#aea8a7",
                                                color: "#fff",
                                                fontSize: "0.65rem",
                                                cursor: "pointer"
                                            }}
                                            onClick={(e) => {
                                                e.stopPropagation(); // ✅ prevent row select
                                                let newData = [...multivalveData]
                                                newData = newData.filter(
                                                (_, index) => index !== rowIndex
                                                );
                                                // console.log(rowIndex,tableMeta);
                                                handleSelectedValveAction(value,tableMeta.rowData, {
                                                    dataIndex: tableMeta.rowIndex,
                                                    action:'remove'
                                                })
                                            }}
                                            > 
                                            <span style={{ fontSize: "0.50rem", color:'blue',paddingRight:'5px' }}>LS</span> X Remove
                                            
                                            </button>
                                            :

                                            <button
                                            type="button"
                                            style={{
                                                width: "100%",
                                                padding: "0.25rem 0.35rem",
                                                border: "1px solid #706c6c",
                                                borderRadius: "0.25rem",
                                                backgroundColor: "#aea8a7",
                                                color: "#fff",
                                                cursor: "pointer"
                                            }}
                                            onClick={(e) => {
                                                e.stopPropagation(); // ✅ prevent row select
                                                let newData = [...multivalveData]
                                                newData = newData.filter(
                                                (_, index) => index !== rowIndex
                                                );
                                                // console.log(rowIndex,tableMeta);
                                                handleSelectedValveAction(value,tableMeta.rowData, {
                                                    dataIndex: tableMeta.rowIndex,
                                                    action:'remove'
                                                })
                                            }}
                                            >
                                            X Remove
                                            
                                            </button>
                                        }
                                        </>);
                                        }
                                }
                        }
                    }else if(item.type === 'input'){
                        return {
                            ...item,
                            options: {
                                customBodyRender: (value, tableMeta) => {
                                    const rowIndex = tableMeta.rowIndex;
                                    const indexRow = multivalveData?.find((_,index) => index === rowIndex)
                                    // console.log(value,' >>>>>>>>>>>> ',rowIndex,item?.name,item?.disabled || indexRow?.disabled);
                                    if(item?.disabled || indexRow?.disabled){
                                        return (<span style={
                                            {
                                                color: indexRow?.errors ? 'red' : 'inherit',
                                                backgroundColor: indexRow?.errors ? 'rgba(241, 137, 137, 0.1)' : 'inherit',
                                            }
                                            }>
                                            {value}
                                        </span>)
                                    }else{
                                        return (
                                            // <CustomToolTip {...item} infoText={undefined} fieldName={item.name}>
                                            <input
                                            name={item.name}
                                            value={value || ""}

                                            style={{
                                                width: "100%",
                                                padding: "4px",
                                                border: indexRow?.errors ? "1px solid red" : "1px solid #ccc",
                                                borderRadius: "4px",
                                                color: indexRow?.errors ? 'red' : 'inherit',
                                                backgroundColor: indexRow?.errors ? 'rgba(241, 137, 137, 0.1)' : 'inherit',
                                            }}
                                            disabled={indexRow?.disabled ?? false}
                                            onChange={(e) => {
                                                handleSelectedValveAction(value,tableMeta.rowData, {
                                                        dataIndex: tableMeta.rowIndex,
                                                        name: e.target.name,
                                                        value: e.target.value,
                                                        action:'onChange'
                                                    })
                                            }}
                                            
                                            onBlur={(e) => {
                                                handleSelectedValveAction(value,tableMeta.rowData, {
                                                        dataIndex: tableMeta.rowIndex,
                                                        name: e.target.name,
                                                        value: e.target.value,
                                                        action:'onBlur'
                                                    })
                                            }}
                                            />
                                            // </CustomToolTip>
                                        );
                                    }
                                }
                            }
                        }
                    }else{
                        return {
                            ...item,
                             options: {
                                customBodyRender: (value,tableMeta) => {
                                    const rowIndex = tableMeta.rowIndex;
                                    const indexRow = multivalveData?.find((_,index) => index === rowIndex);

                                    return (
                                        <span style={
                                            {
                                                color: indexRow?.errors ? 'red' : 'inherit',
                                                backgroundColor: indexRow?.errors ? 'rgba(241, 137, 137, 0.1)' : 'inherit',
                                            }
                                            }>
                                            {value}
                                        </span>
                                    )
                                }
                             }
                        }
                    }
                });
                setMultivalveColumn(localcolumns)
            }
            // setMultivalveColumn([
            //     {
            //                         name: "ValveId",
            //                         label: "Click to Remove",
            //                         options: {
            //                             customBodyRender: (value, tableMeta) => {
            //                             const rowIndex = tableMeta.rowIndex;
            //                             return (<>
            //                                 {rowIndex === 0 ?
            //                                 <button
            //                                 type="button"
            //                                 style={{
            //                                     width: "100%",
            //                                     padding: "0.25rem 0.35rem",
            //                                     border: "1px solid #706c6c",
            //                                     borderRadius: "0.25rem",
            //                                     backgroundColor: "#aea8a7",
            //                                     color: "#fff",
            //                                     fontSize: "0.65rem",
            //                                     cursor: "pointer"
            //                                 }}
            //                                 onClick={(e) => {
            //                                     e.stopPropagation(); // ✅ prevent row select
            //                                     let newData = [...multivalveData]
            //                                     newData = newData.filter(
            //                                     (_, index) => index !== rowIndex
            //                                     );
            //                                     console.log(rowIndex,'rowIndexrowIndex');
            //                                     handleRowSelected(tableMeta.rowData, {
            //                                         dataIndex: tableMeta.rowIndex,
            //                                     })
            //                                 }}
            //                                 > 
            //                                 <span style={{ fontSize: "0.50rem", color:'blue',paddingRight:'5px' }}>LS</span> X Remove
                                            
            //                                 </button>
            //                                 :

            //                                 <button
            //                                 type="button"
            //                                 style={{
            //                                     width: "100%",
            //                                     padding: "0.25rem 0.35rem",
            //                                     border: "1px solid #706c6c",
            //                                     borderRadius: "0.25rem",
            //                                     backgroundColor: "#aea8a7",
            //                                     color: "#fff",
            //                                     cursor: "pointer"
            //                                 }}
            //                                 onClick={(e) => {
            //                                     e.stopPropagation(); // ✅ prevent row select
            //                                     let newData = [...multivalveData]
            //                                     newData = newData.filter(
            //                                     (_, index) => index !== rowIndex
            //                                     );
            //                                     console.log(rowIndex,'rowIndexrowIndex');
            //                                     handleRowSelected(tableMeta.rowData, {
            //                                         dataIndex: tableMeta.rowIndex,
            //                                     })
            //                                 }}
            //                                 >
            //                                 X Remove
                                            
            //                                 </button>
            //                             }
            //                             </>);
            //                             }
            //                         }
            //                         },

            //                         {name: "ModelNumber",label:"Model"}, 
            //                         {name:"Pset", label:"Percent of Required Flow (%)"},
            //                         {name:"Pset", label:`Set Pressure (${(sizingData.PressureUOM).split('.')[1]})`,
            //                         options: {
            //                                 customBodyRender: (value, tableMeta) => {
            //                                 const rowIndex = tableMeta.rowIndex;
    
            //                                 return (
            //                                     <input
            //                                     value={value || ""}
            //                                     style={{
            //                                         width: "100%",
            //                                         padding: "4px",
            //                                         border: "1px solid #ccc",
            //                                         borderRadius: "4px"
            //                                     }}
            //                                     disabled={rowIndex === 0 }
            //                                     onChange={(e) => {
            //                                         const newData = [...multivalveData];
            //                                         newData[rowIndex] = {
            //                                         ...newData[rowIndex],
            //                                         Pset: e.target.value
            //                                         };
            //                                     }}
            //                                     />
            //                                 );
            //                                 }
            //                         }
            //                         }, 
            //                         {name:"PoverP", label:"Over Pressure % (%)"}, 
            //                         {name:"Pover", label:`Over Pressure (${(sizingData.PressureUOM).split('.')[1]})`}, 
            //                         {name:"W", label:`Rated Flow Capacity (${(sizingData.FlowCapacityUOM).split('.')[1]})`,
            //                             options:{
            //                                 customBodyRender: (value) => Number(value).toFixed(3)
            //                             }
                                         
                                         
            //                         }
            //                     ])
        }
    },[multivalveData])
    // console.log('MultiValveFieldSection .......... ',MultiValveSelectionData?.flowRateMetIconFlag ,MultiValveSelectionData?.TwoOrMoreValveSelectedFlag );
    return (
        <div style={{ margin: "auto 0.875rem", background: "linear-gradient(to bottom, #f6f6f6, #e6e1e1)"}}>
                <div 
                    style={{
                        fontWeight: 640,
                        fontSize:"1rem",
                        minHeight: "2rem",           // increase height
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        background:  "linear-gradient(to bottom, #ffecd2, #fcb69f)", // 2‑color gradient
                        borderRadius: "2px"          // optional, looks nicer
                    }}
                    >
                    Multivalve Selection
                </div>
                <div
                    style={{
                    display: "grid",
                    gridTemplateColumns: "1.1fr 1.1fr 0.8fr",
                    gap: "10px",
                    fontSize: "10px"
                    }}
                >
                    {/* Row 1 */}
                    <InputUom {...MultiValveFieldSection['totalRequiredArea']} onMVChangeActionFlag={true} onChange={handleMultiValveAction}/>
                    <InputUom {...MultiValveFieldSection['totalSelectedArea']} onMVChangeActionFlag={true} onChange={handleMultiValveAction}/>
                    {
                        MultiValveSelectionData?.flowRateMetIconFlag ?
                        <LabelWithIcon {...MultiValveFieldSection['flowRateMetIcon']} /> 
                        : <LabelWithIcon {...MultiValveFieldSection['flowRateNotMetIcon']} />
                    }
                    
                    {/* Row 2 */}
                    <InputUom {...MultiValveFieldSection['RequiredPressFlow']} />
                    <InputUom {...MultiValveFieldSection['RatedPressFlow']} />
                    {!MultiValveSelectionData?.TwoOrMoreValveSelectedFlag ?
                        <LabelWithInfo {...MultiValveFieldSection['selectTwoOrMoreValveIcon']} /> 
                        : <div /> 
                    }

                    {/* Row 3 */}
                    <LabeledInput {...MultiValveFieldSection['TotalSelectedPercentage']} />
                    {MultiValveFieldSection['TotalActualPressFlow']?.visible !== false ?<InputUom {...MultiValveFieldSection['TotalActualPressFlow']} /> : <div />}
                    <div />  {/*empty cell to keep alignment */} 
                    {/* <Button variant="contained"  color="primary"  size="medium"  sx={{ height: "56px", alignSelf:"center", justifySelf:"center", whiteSpace: "nowrap" }}>
                    Configure Selected Valve
                    </Button> */}
                </div>
                <div style={{ margin: "auto 0.875rem" }}>
                    <MuiDataTable
                    data={multivalveData}
                    columns={multivalveColumn}
                    options={customOptions}
                    />
                </div>
                </div>
    )
})
MultivalveSection.propTypes = {
  multivalveData: PropTypes.array,
  multivalveColumn: PropTypes.array
};

export default MultivalveSection;