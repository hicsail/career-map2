export let config = {
	'access_token':'pk.eyJ1IjoiaGFyaXJpc2FpbCIsImEiOiJjazZ3aGF2MmkwN2pvM21vYmZtYTJrOG13In0.4IxSwTcKWq1ms7F-B8v2Iw',	
	//'propertiesToIds': {
	//	'State ILP': {'HTMLId': /*'stateILP'*/'stateILPProces','isLink': false},
	//	'ILP Webpage': {'HTMLId': /*'ILPWebpage'*/'stateILPProces','isLink': true},
	//	'ILP Contact Name + Email': {'HTMLId': /*'ILPInfo'*/'stateILPProces','isLink': false},
	//	'ILP Policy': {'HTMLId': /*'ILPPolicy'*/'stateILPProces', 'isLink': true},
	//	'ILP Guide': {'HTMLId': /*'ILPGuide'*/'stateILPProces','isLink': true},
	//	'State K12 Equity Plan': {'HTMLId': /*'equityPlan'*/'ILPDEI','isLink': true},
	//	'State ESSA Plan': {'HTMLId': /*'stateESSAPlan'*/'ILPDEI','isLink': true},
	//	'ILP Equity Reference ': {'HTMLId': /*'ILPEquityReference'*/'ILPDEI','isLink': true},	
	//	'ILP Funding': {'HTMLId': 'ILPFunding','isLink': true},
	//	'ILP PD/Training': {'HTMLId': /*'PD/Training'*/'ILPSupport','isLink': true},
	//	'ILP Standards': {'HTMLId': /*'ILPStandards'*/'ILPSupport','isLink': true},	
	//	'ILP Curriculum &/or Lessons': {'HTMLId': /*'ILPCurriculum'*/'ILPSupport','isLink': true},
	//	'ILP Tech Platform': {'HTMLId': /*'techPlatform'*/'ILPTechPlatform','isLink': true},
	//},
	'propertiesToIds': {
		'stateILPProces': [
			{'key': 'State ILP','isLink': false},
			{'key': 'ILP Webpage','isLink': true},
			{'key': 'ILP Contact Name + Email','isLink': false},
			{'key': 'ILP Policy','isLink': true},
			{'key': 'ILP Guide','isLink': true},
		],
		'ILPDEI': [
			{'key': 'State K12 Equity Plan','isLink': true},
			{'key': 'State ESSA Plan','isLink': true},
			{'key': 'ILP Equity Reference','isLink': true}			
		],
		'ILP Funding': [
			{'key': 'ILP Funding','isLink': true}					
		],
		'ILPSupport': [
			{'key': 'ILP PD/Training','isLink': true},
			{'key': 'ILP Standards','isLink': true},
			{'key': 'ILP Curriculum &/or Lessons','isLink': true}			
		],
		'ILPTechPlatform': [
			{'key': 'ILP Tech Platform','isLink': true}					
		],
		'SEL': [
			{'key': 'State SEL Webpage','isLink': true},
			{'key': 'SEL in ILP Reference','isLink': true}					
		],
		'CTE': [
			{'key': 'State Perkins V Plan','isLink': true},
			{'key': 'K12 CTE','isLink': true},
			{'key': 'K12 CTE, Career Pathways in ILP Reference','isLink': true}					
		],
		'dualEnrollment': [
			{'key': 'Dual Enrollment Webpage','isLink': true}						
		],
		'IRCs': [
			{'key': 'IRC Webpage','isLink': true}					
		],
		'WBL': [
			{'key': 'WBL Webpage','isLink': true},
			{'key': 'WBL Guide','isLink': true}					
		]		
	}
}