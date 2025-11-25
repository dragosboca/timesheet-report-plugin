// Enhanced Peggy grammar for retainer-specific timesheet query language
// This extends the base grammar with sophisticated retainer management features

{
  // Enhanced helper functions for retainer AST node creation
  function createLiteral(value, dataType) {
    return {
      type: 'Literal',
      value: value,
      dataType
    };
  }

  function createIdentifier(name) {
    return {
      type: 'Identifier',
      name
    };
  }

  function createBinaryExpression(left, operator, right) {
    return {
      type: 'BinaryExpression',
      left,
      operator,
      right
    };
  }

  function createWhereClause(conditions) {
    return {
      type: 'WhereClause',
      conditions
    };
  }

  function createShowClause(fields) {
    return {
      type: 'ShowClause',
      fields
    };
  }

  function createViewClause(viewType) {
    return {
      type: 'ViewClause',
      viewType
    };
  }

  function createChartClause(chartType) {
    return {
      type: 'ChartClause',
      chartType
    };
  }

  function createPeriodClause(period) {
    return {
      type: 'PeriodClause',
      period
    };
  }

  function createSizeClause(size) {
    return {
      type: 'SizeClause',
      size
    };
  }

  function createQuery(clauses) {
    return {
      type: 'Query',
      clauses: clauses.filter(c => c !== null)
    };
  }

  function createDateRange(start, end) {
    return {
      type: 'DateRange',
      start,
      end
    };
  }

  function createList(items) {
    return {
      type: 'List',
      items
    };
  }

  // NEW: Retainer-specific AST node creators
  function createRetainerClause(retainerType, options) {
    return {
      type: 'RetainerClause',
      retainerType,
      options: options || {}
    };
  }

  function createServiceClause(categories, options) {
    return {
      type: 'ServiceClause',
      categories,
      options: options || {}
    };
  }

  function createRolloverClause(rolloverType, options) {
    return {
      type: 'RolloverClause',
      rolloverType,
      options: options || {}
    };
  }

  function createUtilizationClause(utilizationType, threshold) {
    return {
      type: 'UtilizationClause',
      utilizationType,
      threshold: threshold || null
    };
  }

  function createContractClause(contractType, options) {
    return {
      type: 'ContractClause',
      contractType,
      options: options || {}
    };
  }

  function createValueClause(valueType, options) {
    return {
      type: 'ValueClause',
      valueType,
      options: options || {}
    };
  }

  function createAlertClause(alertType, threshold) {
    return {
      type: 'AlertClause',
      alertType,
      threshold
    };
  }

  function createForecastClause(forecastType, horizon) {
    return {
      type: 'ForecastClause',
      forecastType,
      horizon: horizon || 'month'
    };
  }
}

// Main query structure - enhanced to support retainer features
Query
  = clauses:(Clause (_ Clause)*) {
      return createQuery(clauses.map(c => c[0]));
    }

Clause
  = WhereClause
  / ShowClause
  / ViewClause
  / ChartClause
  / PeriodClause
  / SizeClause
  / RetainerClause    // NEW
  / ServiceClause     // NEW
  / RolloverClause    // NEW
  / UtilizationClause // NEW
  / ContractClause    // NEW
  / ValueClause       // NEW
  / AlertClause       // NEW
  / ForecastClause    // NEW

// Enhanced WHERE clause with retainer-specific fields
WhereClause
  = "WHERE"i __ conditions:(Condition (_ "AND"i __ Condition)*) {
      const all = [conditions[0]];
      if (conditions[1]) {
        conditions[1].forEach(item => all.push(item[3]));
      }
      return createWhereClause(all);
    }

Condition
  = RangeCondition
  / ComparisonCondition
  / ListCondition
  / ServiceCondition      // NEW
  / UtilizationCondition  // NEW
  / RolloverCondition     // NEW
  / ValueCondition        // NEW

// NEW: Service category conditions
ServiceCondition
  = "service"i __ operator:ComparisonOperator __ category:ServiceCategory {
      return createBinaryExpression(
        createIdentifier('service'),
        operator,
        createLiteral(category, 'string')
      );
    }
  / "category"i __ operator:ComparisonOperator __ category:ServiceCategory {
      return createBinaryExpression(
        createIdentifier('category'),
        operator,
        createLiteral(category, 'string')
      );
    }

// NEW: Utilization-based conditions
UtilizationCondition
  = "utilization"i __ operator:ComparisonOperator __ value:Number {
      return createBinaryExpression(
        createIdentifier('utilization'),
        operator,
        createLiteral(parseFloat(value), 'number')
      );
    }
  / "usage"i __ operator:ComparisonOperator __ value:Number {
      return createBinaryExpression(
        createIdentifier('usage'),
        operator,
        createLiteral(parseFloat(value), 'number')
      );
    }

// NEW: Rollover hour conditions
RolloverCondition
  = "rollover"i __ operator:ComparisonOperator __ value:Number {
      return createBinaryExpression(
        createIdentifier('rollover'),
        operator,
        createLiteral(parseFloat(value), 'number')
      );
    }
  / "banked"i __ operator:ComparisonOperator __ value:Number {
      return createBinaryExpression(
        createIdentifier('banked'),
        operator,
        createLiteral(parseFloat(value), 'number')
      );
    }

// NEW: Value impact conditions
ValueCondition
  = "value"i __ operator:ComparisonOperator __ amount:Number {
      return createBinaryExpression(
        createIdentifier('value'),
        operator,
        createLiteral(parseFloat(amount), 'number')
      );
    }
  / "impact"i __ operator:ComparisonOperator __ amount:Number {
      return createBinaryExpression(
        createIdentifier('impact'),
        operator,
        createLiteral(parseFloat(amount), 'number')
      );
    }

// Existing conditions with retainer field support
RangeCondition
  = field:Field __ "BETWEEN"i __ start:Value __ "AND"i __ end:Value {
      return createBinaryExpression(field, 'BETWEEN', createDateRange(start, end));
    }

ComparisonCondition
  = field:Field __ operator:ComparisonOperator __ value:Value {
      return createBinaryExpression(field, operator, value);
    }

ListCondition
  = field:Field __ "IN"i __ items:List {
      return createBinaryExpression(field, 'IN', items);
    }

// Enhanced field support including retainer fields
Field
  = StandardField
  / RetainerField  // NEW

StandardField
  = "year"i      { return createIdentifier('year'); }
  / "month"i     { return createIdentifier('month'); }
  / "project"i   { return createIdentifier('project'); }
  / "date"i      { return createIdentifier('date'); }
  / "hours"i     { return createIdentifier('hours'); }
  / "budget"i    { return createIdentifier('budget'); }

// NEW: Retainer-specific fields
RetainerField
  = "service"i      { return createIdentifier('service'); }
  / "category"i     { return createIdentifier('category'); }
  / "utilization"i  { return createIdentifier('utilization'); }
  / "usage"i        { return createIdentifier('usage'); }
  / "rollover"i     { return createIdentifier('rollover'); }
  / "banked"i       { return createIdentifier('banked'); }
  / "remaining"i    { return createIdentifier('remaining'); }
  / "available"i    { return createIdentifier('available'); }
  / "allocated"i    { return createIdentifier('allocated'); }
  / "burned"i       { return createIdentifier('burned'); }
  / "efficiency"i   { return createIdentifier('efficiency'); }
  / "response_time"i { return createIdentifier('response_time'); }
  / "satisfaction"i { return createIdentifier('satisfaction'); }
  / "value"i        { return createIdentifier('value'); }
  / "impact"i       { return createIdentifier('impact'); }
  / "priority"i     { return createIdentifier('priority'); }

// Enhanced SHOW clause with retainer metrics
ShowClause
  = "SHOW"i __ fields:(ShowField (_ "," __ ShowField)*) {
      const all = [fields[0]];
      if (fields[1]) {
        fields[1].forEach(item => all.push(item[3]));
      }
      return createShowClause(all);
    }

ShowField
  = StandardShowField
  / RetainerShowField  // NEW

StandardShowField
  = "hours"i        { return createIdentifier('hours'); }
  / "invoiced"i     { return createIdentifier('invoiced'); }
  / "progress"i     { return createIdentifier('progress'); }
  / "utilization"i  { return createIdentifier('utilization'); }
  / "remaining"i    { return createIdentifier('remaining'); }

// NEW: Retainer-specific show fields
RetainerShowField
  = "service_mix"i     { return createIdentifier('service_mix'); }
  / "rollover"i        { return createIdentifier('rollover'); }
  / "banked"i          { return createIdentifier('banked'); }
  / "allocated"i       { return createIdentifier('allocated'); }
  / "burned"i          { return createIdentifier('burned'); }
  / "efficiency"i      { return createIdentifier('efficiency'); }
  / "response_time"i   { return createIdentifier('response_time'); }
  / "satisfaction"i    { return createIdentifier('satisfaction'); }
  / "value_delivered"i { return createIdentifier('value_delivered'); }
  / "health_score"i    { return createIdentifier('health_score'); }
  / "forecast"i        { return createIdentifier('forecast'); }

// Enhanced VIEW clause with retainer-specific views
ViewClause
  = "VIEW"i __ viewType:ViewType {
      return createViewClause(viewType);
    }

ViewType
  = StandardViewType
  / RetainerViewType  // NEW

StandardViewType
  = "summary"i  { return 'summary'; }
  / "chart"i    { return 'chart'; }
  / "table"i    { return 'table'; }
  / "full"i     { return 'full'; }

// NEW: Retainer-specific view types
RetainerViewType
  = "retainer"i     { return 'retainer'; }
  / "health"i       { return 'health'; }
  / "rollover"i     { return 'rollover'; }
  / "services"i     { return 'services'; }
  / "contract"i     { return 'contract'; }
  / "performance"i  { return 'performance'; }
  / "renewal"i      { return 'renewal'; }

// Enhanced CHART clause with retainer charts
ChartClause
  = "CHART"i __ chartType:ChartType {
      return createChartClause(chartType);
    }

ChartType
  = StandardChartType
  / RetainerChartType  // NEW

StandardChartType
  = "trend"i    { return 'trend'; }
  / "monthly"i  { return 'monthly'; }
  / "budget"i   { return 'budget'; }

// NEW: Retainer-specific chart types
RetainerChartType
  = "utilization"i    { return 'utilization'; }
  / "service_mix"i    { return 'service_mix'; }
  / "rollover_trend"i { return 'rollover_trend'; }
  / "health_score"i   { return 'health_score'; }
  / "value_delivery"i { return 'value_delivery'; }
  / "response_time"i  { return 'response_time'; }
  / "satisfaction"i   { return 'satisfaction'; }
  / "forecast"i       { return 'forecast'; }
  / "burn_rate"i      { return 'burn_rate'; }

// NEW: RETAINER clause for retainer-specific analysis
RetainerClause
  = "RETAINER"i __ retainerType:RetainerType options:RetainerOptions? {
      return createRetainerClause(retainerType, options);
    }

RetainerType
  = "health"i       { return 'health'; }
  / "status"i       { return 'status'; }
  / "forecast"i     { return 'forecast'; }
  / "analysis"i     { return 'analysis'; }
  / "performance"i  { return 'performance'; }
  / "optimization"i { return 'optimization'; }

RetainerOptions
  = __ "WITH"i __ option:RetainerOption {
      return { [option.key]: option.value };
    }

RetainerOption
  = "threshold"i __ "=" __ value:Number {
      return { key: 'threshold', value: parseFloat(value) };
    }
  / "period"i __ "=" __ value:String {
      return { key: 'period', value };
    }

// NEW: SERVICE clause for service category analysis
ServiceClause
  = "SERVICE"i __ categories:ServiceCategoryList options:ServiceOptions? {
      return createServiceClause(categories, options);
    }

ServiceCategoryList
  = category:ServiceCategory {
      return [category];
    }
  / "(" __ first:ServiceCategory rest:(__ "," __ ServiceCategory)* __ ")" {
      const all = [first];
      rest.forEach(item => all.push(item[3]));
      return all;
    }

ServiceCategory
  = "development"i   { return 'development'; }
  / "support"i       { return 'support'; }
  / "consulting"i    { return 'consulting'; }
  / "strategy"i      { return 'strategy'; }
  / "training"i      { return 'training'; }
  / "maintenance"i   { return 'maintenance'; }
  / "emergency"i     { return 'emergency'; }
  / "general"i       { return 'general'; }

ServiceOptions
  = __ "WITH"i __ option:ServiceOption {
      return { [option.key]: option.value };
    }

ServiceOption
  = "efficiency"i __ "=" __ value:("high"i / "medium"i / "low"i) {
      return { key: 'efficiency', value: value.toLowerCase() };
    }
  / "priority"i __ "=" __ value:("urgent"i / "normal"i / "low"i) {
      return { key: 'priority', value: value.toLowerCase() };
    }

// NEW: ROLLOVER clause for rollover hour management
RolloverClause
  = "ROLLOVER"i __ rolloverType:RolloverType options:RolloverOptions? {
      return createRolloverClause(rolloverType, options);
    }

RolloverType
  = "status"i      { return 'status'; }
  / "available"i   { return 'available'; }
  / "expiring"i    { return 'expiring'; }
  / "history"i     { return 'history'; }
  / "forecast"i    { return 'forecast'; }

RolloverOptions
  = __ "WITHIN"i __ period:Period {
      return { period };
    }
  / __ "EXPIRING"i __ "IN"i __ days:Number __ "DAYS"i {
      return { expiringDays: parseInt(days) };
    }

// NEW: UTILIZATION clause for usage analysis
UtilizationClause
  = "UTILIZATION"i __ utilizationType:UtilizationType threshold:UtilizationThreshold? {
      return createUtilizationClause(utilizationType, threshold);
    }

UtilizationType
  = "current"i     { return 'current'; }
  / "target"i      { return 'target'; }
  / "average"i     { return 'average'; }
  / "trend"i       { return 'trend'; }
  / "efficiency"i  { return 'efficiency'; }

UtilizationThreshold
  = __ "ABOVE"i __ value:Number {
      return { type: 'above', value: parseFloat(value) };
    }
  / __ "BELOW"i __ value:Number {
      return { type: 'below', value: parseFloat(value) };
    }
  / __ "BETWEEN"i __ min:Number __ "AND"i __ max:Number {
      return { type: 'between', min: parseFloat(min), max: parseFloat(max) };
    }

// NEW: CONTRACT clause for contract management
ContractClause
  = "CONTRACT"i __ contractType:ContractType options:ContractOptions? {
      return createContractClause(contractType, options);
    }

ContractType
  = "status"i      { return 'status'; }
  / "renewal"i     { return 'renewal'; }
  / "performance"i { return 'performance'; }
  / "health"i      { return 'health'; }
  / "terms"i       { return 'terms'; }

ContractOptions
  = __ "DUE"i __ "IN"i __ days:Number __ "DAYS"i {
      return { dueInDays: parseInt(days) };
    }
  / __ "WITH"i __ "RISK"i __ level:("high"i / "medium"i / "low"i) {
      return { riskLevel: level.toLowerCase() };
    }

// NEW: VALUE clause for value delivery analysis
ValueClause
  = "VALUE"i __ valueType:ValueType options:ValueOptions? {
      return createValueClause(valueType, options);
    }

ValueType
  = "delivered"i   { return 'delivered'; }
  / "projected"i   { return 'projected'; }
  / "impact"i      { return 'impact'; }
  / "roi"i         { return 'roi'; }
  / "efficiency"i  { return 'efficiency'; }

ValueOptions
  = __ "ABOVE"i __ amount:Number {
      return { threshold: parseFloat(amount), type: 'above' };
    }
  / __ "BY"i __ category:ServiceCategory {
      return { category };
    }

// NEW: ALERT clause for threshold monitoring
AlertClause
  = "ALERT"i __ alertType:AlertType __ "AT"i __ threshold:Number "%" {
      return createAlertClause(alertType, parseFloat(threshold));
    }

AlertType
  = "utilization"i  { return 'utilization'; }
  / "rollover"i     { return 'rollover'; }
  / "budget"i       { return 'budget'; }
  / "satisfaction"i { return 'satisfaction'; }
  / "response"i     { return 'response'; }

// NEW: FORECAST clause for predictive analysis
ForecastClause
  = "FORECAST"i __ forecastType:ForecastType horizon:ForecastHorizon? {
      return createForecastClause(forecastType, horizon);
    }

ForecastType
  = "utilization"i  { return 'utilization'; }
  / "rollover"i     { return 'rollover'; }
  / "renewal"i      { return 'renewal'; }
  / "budget"i       { return 'budget'; }
  / "value"i        { return 'value'; }

ForecastHorizon
  = __ "FOR"i __ period:Period {
      return period;
    }

// Enhanced period support
Period
  = "current-year"i      { return 'current-year'; }
  / "all-time"i          { return 'all-time'; }
  / "last-6-months"i     { return 'last-6-months'; }
  / "last-12-months"i    { return 'last-12-months'; }
  / "next-month"i        { return 'next-month'; }     // NEW
  / "next-quarter"i      { return 'next-quarter'; }   // NEW
  / "contract-term"i     { return 'contract-term'; }  // NEW

PeriodClause
  = "PERIOD"i __ period:Period {
      return createPeriodClause(period);
    }

SizeClause
  = "SIZE"i __ size:Size {
      return createSizeClause(size);
    }

Size
  = "compact"i  { return 'compact'; }
  / "normal"i   { return 'normal'; }
  / "detailed"i { return 'detailed'; }

// Enhanced comparison operators
ComparisonOperator
  = "="         { return '='; }
  / "!="        { return '!='; }
  / ">="        { return '>='; }
  / "<="        { return '<='; }
  / ">"         { return '>'; }
  / "<"         { return '<'; }

// Enhanced value types
Value
  = String
  / Number
  / Date

List
  = "(" __ first:Value rest:(__ "," __ Value)* __ ")" {
      const items = [first];
      if (rest) {
        rest.forEach(item => items.push(item[3]));
      }
      return createList(items);
    }

// String handling with support for service categories
String
  = '"' chars:([^"\\] / EscapedChar)* '"' {
      return createLiteral(chars.join(''), 'string');
    }
  / "'" chars:([^'\\] / EscapedChar)* "'" {
      return createLiteral(chars.join(''), 'string');
    }

EscapedChar
  = "\\" char:. {
      return char;
    }

// Number handling with percentage support
Number
  = digits:[0-9]+ decimals:("." [0-9]+)? "%" {
      const num = digits.join('') + (decimals ? decimals[0] + decimals[1].join('') : '');
      return createLiteral(parseFloat(num), 'percentage');
    }
  / digits:[0-9]+ decimals:("." [0-9]+)? {
      const num = digits.join('') + (decimals ? decimals[0] + decimals[1].join('') : '');
      return createLiteral(parseFloat(num), 'number');
    }

// Date handling with relative date support
Date
  = year:([0-9] [0-9] [0-9] [0-9]) "-" month:([0-9] [0-9]) "-" day:([0-9] [0-9]) {
      const dateStr = year.join('') + '-' + month.join('') + '-' + day.join('');
      return createLiteral(dateStr, 'date');
    }
  / "today"i {
      return createLiteral('today', 'relative_date');
    }
  / "yesterday"i {
      return createLiteral('yesterday', 'relative_date');
    }
  / "last_month"i {
      return createLiteral('last_month', 'relative_date');
    }

// Comments and whitespace
Comment
  = "//" [^\r\n]*
  / "/*" (!"*/" .)* "*/"

__
  = ([ \t\n\r] / Comment)+

_
  = ([ \t\n\r] / Comment)*
