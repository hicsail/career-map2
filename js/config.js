export let config = {
	'accessToken':'pk.eyJ1IjoiaGFyaXJpc2FpbCIsImEiOiJjazZ3aGF2MmkwN2pvM21vYmZtYTJrOG13In0.4IxSwTcKWq1ms7F-B8v2Iw',
	'dataPath': 'data/states-careers3.json',	
	'propertiesToIds': {
		'PCAPName': {'key': 'State Personalized Career & Academic Plan (PCAP) Name','isLink': false},
		'PCAPContact': {'key': 'PCAP Contact','isLink': false},
		'PCAPWebpage': {'key': 'State PCAP Webpage','isLink': true},
		'PCAPGuide': {'key': 'PCAP Guide', 'isLink': true},
		'ESSAPlan': {'key': 'ESSA Plan (Equity Approach)','isLink': true},
		'PCAPPlatform': {'key': 'PCAP Technology Platform','isLink': true},
		'PerkinsVPlan': {'key': 'Perkins V (Career & Technical Education-CTE) Plan','isLink': true},
		'K12CTE': {'key': 'K12 CTE','isLink': true},	
		'K12WBL': {'key': 'K12 Work-Based Learning (WBL)','isLink': true},
		'K12WBLGuide': {'key': 'K12 WBL Guide','isLink': true}		
	},
	'stateRecoms': {
		'PCAPWebpage': ['Alaska', 'Colorado', 'Kansas', 'Kentucky', 'Oklahoma', 'Pennsylvania', 'Wisconsin'],
		'PCAPGuide': ['Colorado', 'Kansas'],
		'PCAPPlatform': ['Alabama', 'Alaska', 'Massachusetts', 'Minnesota', 'Ohio', 'South Dakota', 'Wisconsin'],
		'ESSAPlan': ['Colorado', 'Kansas', 'Ohio', 'Oklahoma', 'Pennsylvania', 'Rhode Island'],
		'PerkinsVPlan': ['Indiana', 'Rhode Island', 'Wisconsin'],
		'K12CTE': ['Colorado', 'Illinois', 'Iowa', 'Massachusetts', 'Rhode Island', 'Tennessee', 'Virginia', 'Washington', 'Wisconsin'],
		'K12WBL': ['Delaware', 'Georgia', 'Iowa', 'Massachusetts', 'Ohio', 'Rhode Island'],
		'K12WBLGuide': ['Delaware', 'Georgia', 'Iowa', 'Massachusetts', 'Ohio', 'Rhode Island']
	}	
}