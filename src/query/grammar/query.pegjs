// Unified Peggy Grammar for Timesheet Query Language
// Combines basic, enhanced, and retainer features into a single coherent grammar

{
  // ============================================================================
  // AST NODE FACTORY FUNCTIONS
  // ============================================================================

  function createLiteral(value, dataType) {
    return { type: 'Literal', value, dataType };
  }

  function createIdentifier(name) {
    return { type: 'Identifier', name };
  }

  function createBinaryExpression(left, operator, right) {
    return { type: 'BinaryExpression', left, operator, right };
  }

  function createDateRange(start, end) {
    return { type: 'DateRange', start, end };
  }

  function createList(items) {
    return { type: 'List', items };
  }

  function createQuery(clauses) {
    return { type: 'Query', clauses: clauses.filter(c => c !== null) };
  }

  // Basic Clause Factories
  function createWhereClause(conditions) {
    return { type: 'WhereClause', conditions };
  }

  function createShowClause(fields) {
    return { type: 'ShowClause', fields };
  }

  function createViewClause(viewType) {
    return { type: 'ViewClause', viewType };
  }

  function createChartClause(chartType) {
    return { type: 'ChartClause', chartType };
  }

  function createPeriodClause(period) {
    return { type: 'PeriodClause', period };
  }

  function createSizeClause(size) {
    return { type: 'SizeClause', size };
  }

  // Enhanced Clause Factories
  function createEnhancedField(expression, alias, format, aggregation) {
    return { type: 'EnhancedField', expression, alias, format, aggregation };
  }

  function createCalculatedField(operator, left, right) {
    return { type: 'CalculatedField', operator, left, right };
  }

  function createAggregationFunction(func, field) {
    return { type: 'AggregationFunction', function: func, field };
  }

  function createFormatSpecifier(formatType, options) {
    return { type: 'FormatSpecifier', formatType, options };
  }

  function createColumnAlias(name) {
    return { type: 'ColumnAlias', name };
  }

  function createOrderByClause(fields) {
    return { type: 'OrderByClause', fields };
  }

  function createGroupByClause(fields) {
    return { type: 'GroupByClause', fields };
  }

  function createHavingClause(conditions) {
    return { type: 'HavingClause', conditions };
  }

  function createLimitClause(limit, offset) {
    return { type: 'LimitClause', limit, offset: offset || 0 };
  }

  // Retainer Clause Factories
  function createRetainerClause(retainerType, options) {
    return { type: 'RetainerClause', retainerType, options: options || {} };
  }

  function createServiceClause(categories, options) {
    return { type: 'ServiceClause', categories, options: options || {} };
  }

  function createRolloverClause(rolloverType, options) {
    return { type: 'RolloverClause', rolloverType, options: options || {} };
  }

  function createUtilizationClause(utilizationType, threshold) {
    return { type: 'UtilizationClause', utilizationType, threshold: threshold || null };
  }

  function createContractClause(contractType, options) {
    return { type: 'ContractClause', contractType, options: options || {} };
  }

  function createValueClause(valueType, options) {
    return { type: 'ValueClause', valueType, options: options || {} };
  }

  function createAlertClause(alertType, threshold) {
    return { type: 'AlertClause', alertType, threshold };
  }

  function createForecastClause(forecastType, horizon) {
    return { type: 'ForecastClause', forecastType, horizon: horizon || 'month' };
  }
}

// ============================================================================
// MAIN QUERY STRUCTURE
// ============================================================================

Query
  = _ clauses:(Clause (_ Clause)*)? _ {
      if (!clauses) return createQuery([]);
      const allClauses = [clauses[0]];
      if (clauses[1]) {
        clauses[1].forEach(item => allClauses.push(item[1]));
      }
      return createQuery(allClauses);
    }

Clause
  = Comment { return null; }
  / WhereClause
  / ShowClause
  / ViewClause
  / ChartClause
  / PeriodClause
  / SizeClause
  / OrderByClause
  / GroupByClause
  / HavingClause
  / LimitClause
  / RetainerClause
  / ServiceClause
  / RolloverClause
  / UtilizationClause
  / ContractClause
  / ValueClause
  / AlertClause
  / ForecastClause

// ============================================================================
// WHERE CLAUSE - Filtering Conditions
// ============================================================================

WhereClause
  = "WHERE"i __ conditions:ConditionList {
      return createWhereClause(conditions);
    }

ConditionList
  = first:Condition rest:(_ "AND"i __ condition:Condition { return condition; })* {
      return [first, ...rest];
    }

Condition
  = RangeCondition
  / ComparisonCondition
  / ListCondition
  / InExpression
  / NotInExpression
  / LikeExpression
  / NullCheckExpression
  / ServiceCondition
  / UtilizationCondition
  / RolloverCondition
  / ValueCondition

RangeCondition
  = field:FieldReference __ "BETWEEN"i __ start:Value __ "AND"i __ end:Value {
      return createBinaryExpression(field, 'BETWEEN', createDateRange(start, end));
    }

ComparisonCondition
  = field:FieldReference __ operator:ComparisonOperator __ value:Value {
      return createBinaryExpression(field, operator, value);
    }

ListCondition
  = field:FieldReference __ "IN"i __ items:ListValue {
      return createBinaryExpression(field, 'IN', items);
    }

InExpression
  = field:FieldReference __ "IN"i __ "(" _ values:ValueList _ ")" {
      return { type: 'InExpression', field, values };
    }

NotInExpression
  = field:FieldReference __ "NOT"i __ "IN"i __ "(" _ values:ValueList _ ")" {
      return { type: 'NotInExpression', field, values };
    }

LikeExpression
  = field:FieldReference __ "LIKE"i __ pattern:String {
      return { type: 'LikeExpression', field, pattern };
    }

NullCheckExpression
  = field:FieldReference __ "IS"i __ not:"NOT"i? __ "NULL"i {
      return { type: 'IsNullExpression', field, isNull: !not };
    }

// Retainer-specific conditions
ServiceCondition
  = ("service"i / "category"i) __ operator:ComparisonOperator __ category:ServiceCategory {
      return createBinaryExpression(createIdentifier('service'), operator, category);
    }

UtilizationCondition
  = ("utilization"i / "usage"i) __ operator:ComparisonOperator __ value:NumberValue {
      return createBinaryExpression(createIdentifier('utilization'), operator, value);
    }

RolloverCondition
  = ("rollover"i / "banked"i) __ operator:ComparisonOperator __ value:NumberValue {
      return createBinaryExpression(createIdentifier('rollover'), operator, value);
    }

ValueCondition
  = ("value"i / "impact"i) __ operator:ComparisonOperator __ value:NumberValue {
      return createBinaryExpression(createIdentifier('value'), operator, value);
    }

// ============================================================================
// SHOW CLAUSE - Field Selection with Enhanced Features
// ============================================================================

ShowClause
  = "SHOW"i __ fields:FieldList {
      return createShowClause(fields);
    }

FieldList
  = first:EnhancedField rest:(_ "," _ field:EnhancedField { return field; })* {
      return [first, ...rest];
    }

EnhancedField
  = aggr:AggregationFunction alias:ColumnAlias? format:FormatClause? {
      return createEnhancedField(aggr, alias, format, aggr.function);
    }
  / expr:CalculatedExpression alias:ColumnAlias? format:FormatClause? {
      return createEnhancedField(expr, alias, format, null);
    }
  / field:FieldReference alias:ColumnAlias format:FormatClause? {
      return createEnhancedField(field, alias, format, null);
    }
  / field:FieldReference format:FormatClause {
      return createEnhancedField(field, null, format, null);
    }
  / field:FieldReference {
      return field;
    }

FieldExpression
  = CalculatedExpression
  / FieldReference

CalculatedExpression
  = left:CalculatedTerm _ operator:("+" / "-") _ right:CalculatedExpression {
      return createCalculatedField(operator, left, right);
    }
  / CalculatedTerm

CalculatedTerm
  = left:CalculatedFactor _ operator:("*" / "/") _ right:CalculatedTerm {
      return createCalculatedField(operator, left, right);
    }
  / CalculatedFactor

CalculatedFactor
  = "(" _ expr:CalculatedExpression _ ")" { return expr; }
  / NumberValue
  / FieldReference

AggregationFunction
  = func:AggregationName "(" _ field:FieldReference _ ")" {
      return createAggregationFunction(func, field);
    }

AggregationName
  = "SUM"i { return 'sum'; }
  / "AVG"i / "AVERAGE"i { return 'avg'; }
  / "COUNT"i { return 'count'; }
  / "MIN"i { return 'min'; }
  / "MAX"i { return 'max'; }
  / "TOTAL"i { return 'sum'; }

ColumnAlias
  = _ "AS"i __ alias:String {
      return createColumnAlias(alias.value);
    }
  / _ "AS"i __ alias:Identifier {
      return createColumnAlias(alias.name);
    }

FormatClause
  = _ "FORMAT"i __ format:FormatSpecifier { return format; }

FormatSpecifier
  = type:FormatType options:FormatOptions? {
      return createFormatSpecifier(type, options);
    }

FormatType
  = "CURRENCY"i / "MONEY"i { return 'currency'; }
  / "PERCENT"i / "PERCENTAGE"i { return 'percentage'; }
  / "HOURS"i / "TIME"i { return 'hours'; }
  / "DECIMAL"i { return 'decimal'; }
  / "INTEGER"i { return 'integer'; }
  / "DATE"i { return 'date'; }
  / "TEXT"i { return 'text'; }

FormatOptions
  = "(" _ options:FormatOptionList _ ")" { return options; }

FormatOptionList
  = first:FormatOption rest:(_ "," _ option:FormatOption { return option; })* {
      return Object.assign({}, first, ...rest);
    }

FormatOption
  = "DECIMALS"i _ "=" _ decimals:NumberValue {
      return { decimals: decimals.value };
    }
  / "PRECISION"i _ "=" _ precision:NumberValue {
      return { precision: precision.value };
    }
  / "CURRENCY"i _ "=" _ currency:String {
      return { currency: currency.value };
    }
  / "SYMBOL"i _ "=" _ symbol:String {
      return { symbol: symbol.value };
    }
  / "LOCALE"i _ "=" _ locale:String {
      return { locale: locale.value };
    }

// ============================================================================
// BASIC CLAUSES - View, Chart, Period, Size
// ============================================================================

ViewClause
  = "VIEW"i __ viewType:ViewType {
      return createViewClause(viewType);
    }

ViewType
  = "summary"i { return 'summary'; }
  / "chart"i { return 'chart'; }
  / "table"i { return 'table'; }
  / "full"i { return 'full'; }

ChartClause
  = "CHART"i __ chartType:ChartType {
      return createChartClause(chartType);
    }

ChartType
  = "trend"i { return 'trend'; }
  / "monthly"i { return 'monthly'; }
  / "budget"i { return 'budget'; }

PeriodClause
  = "PERIOD"i __ period:PeriodType {
      return createPeriodClause(period);
    }

PeriodType
  = "current-year"i { return 'current-year'; }
  / "all-time"i { return 'all-time'; }
  / "last-6-months"i { return 'last-6-months'; }
  / "last-12-months"i { return 'last-12-months'; }

SizeClause
  = "SIZE"i __ size:SizeType {
      return createSizeClause(size);
    }

SizeType
  = "compact"i { return 'compact'; }
  / "normal"i { return 'normal'; }
  / "detailed"i { return 'detailed'; }

// ============================================================================
// ENHANCED CLAUSES - ORDER BY, GROUP BY, HAVING, LIMIT
// ============================================================================

OrderByClause
  = "ORDER"i __ "BY"i __ fields:OrderFieldList {
      return createOrderByClause(fields);
    }

OrderFieldList
  = first:OrderField rest:(_ "," _ field:OrderField { return field; })* {
      return [first, ...rest];
    }

OrderField
  = field:FieldReference _ direction:OrderDirection? {
      return { field, direction: direction || 'asc' };
    }

OrderDirection
  = "ASC"i { return 'asc'; }
  / "DESC"i { return 'desc'; }

GroupByClause
  = "GROUP"i __ "BY"i __ fields:GroupFieldList {
      return createGroupByClause(fields);
    }

GroupFieldList
  = first:FieldReference rest:(_ "," _ field:FieldReference { return field; })* {
      return [first, ...rest];
    }

HavingClause
  = "HAVING"i __ conditions:ConditionList {
      return createHavingClause(conditions);
    }

LimitClause
  = "LIMIT"i __ limit:NumberValue offset:LimitOffset? {
      return createLimitClause(limit.value, offset);
    }

LimitOffset
  = __ "OFFSET"i __ offset:NumberValue { return offset.value; }

// ============================================================================
// RETAINER CLAUSES - Retainer Management Features
// ============================================================================

RetainerClause
  = "RETAINER"i __ retainerType:RetainerType options:RetainerOptions? {
      return createRetainerClause(retainerType, options);
    }

RetainerType
  = "health"i { return 'health'; }
  / "status"i { return 'status'; }
  / "forecast"i { return 'forecast'; }
  / "analysis"i { return 'analysis'; }
  / "performance"i { return 'performance'; }
  / "optimization"i { return 'optimization'; }

RetainerOptions
  = __ "(" _ options:OptionList _ ")" { return options; }

ServiceClause
  = "SERVICE"i __ categories:ServiceCategoryList options:ServiceOptions? {
      return createServiceClause(categories, options);
    }

ServiceCategoryList
  = first:ServiceCategory rest:(_ "," _ cat:ServiceCategory { return cat; })* {
      return [first.value, ...rest.map(c => c.value)];
    }

ServiceCategory
  = "development"i { return createLiteral('development', 'string'); }
  / "design"i { return createLiteral('design', 'string'); }
  / "consulting"i { return createLiteral('consulting', 'string'); }
  / "support"i { return createLiteral('support', 'string'); }
  / "maintenance"i { return createLiteral('maintenance', 'string'); }
  / String

ServiceOptions
  = __ "(" _ options:OptionList _ ")" { return options; }

RolloverClause
  = "ROLLOVER"i __ rolloverType:RolloverType options:RolloverOptions? {
      return createRolloverClause(rolloverType, options);
    }

RolloverType
  = "status"i { return 'status'; }
  / "available"i { return 'available'; }
  / "expiring"i { return 'expiring'; }
  / "history"i { return 'history'; }
  / "forecast"i { return 'forecast'; }

RolloverOptions
  = __ "(" _ options:OptionList _ ")" { return options; }

UtilizationClause
  = "UTILIZATION"i __ utilizationType:UtilizationType threshold:UtilizationThreshold? {
      return createUtilizationClause(utilizationType, threshold);
    }

UtilizationType
  = "current"i { return 'current'; }
  / "target"i { return 'target'; }
  / "average"i { return 'average'; }
  / "trend"i { return 'trend'; }
  / "efficiency"i { return 'efficiency'; }

UtilizationThreshold
  = __ threshold:ThresholdSpec { return threshold; }

ContractClause
  = "CONTRACT"i __ contractType:ContractType options:ContractOptions? {
      return createContractClause(contractType, options);
    }

ContractType
  = "status"i { return 'status'; }
  / "renewal"i { return 'renewal'; }
  / "performance"i { return 'performance'; }
  / "health"i { return 'health'; }
  / "terms"i { return 'terms'; }

ContractOptions
  = __ "(" _ options:OptionList _ ")" { return options; }

ValueClause
  = "VALUE"i __ valueType:ValueType options:ValueOptions? {
      return createValueClause(valueType, options);
    }

ValueType
  = "delivered"i { return 'delivered'; }
  / "projected"i { return 'projected'; }
  / "impact"i { return 'impact'; }
  / "roi"i { return 'roi'; }
  / "efficiency"i { return 'efficiency'; }

ValueOptions
  = __ "(" _ options:OptionList _ ")" { return options; }

AlertClause
  = "ALERT"i __ alertType:AlertType __ threshold:NumberValue {
      return createAlertClause(alertType, threshold.value);
    }

AlertType
  = "utilization"i { return 'utilization'; }
  / "rollover"i { return 'rollover'; }
  / "budget"i { return 'budget'; }
  / "satisfaction"i { return 'satisfaction'; }
  / "response"i { return 'response'; }

ForecastClause
  = "FORECAST"i __ forecastType:ForecastType horizon:ForecastHorizon? {
      return createForecastClause(forecastType, horizon);
    }

ForecastType
  = "utilization"i { return 'utilization'; }
  / "rollover"i { return 'rollover'; }
  / "renewal"i { return 'renewal'; }
  / "budget"i { return 'budget'; }
  / "value"i { return 'value'; }

ForecastHorizon
  = __ horizon:HorizonType { return horizon; }

HorizonType
  = "month"i { return 'month'; }
  / "quarter"i { return 'quarter'; }
  / "year"i { return 'year'; }
  / "contract-term"i { return 'contract-term'; }

// ============================================================================
// HELPER STRUCTURES - Options, Thresholds
// ============================================================================

OptionList
  = first:Option rest:(_ "," _ option:Option { return option; })* {
      return Object.assign({}, first, ...rest);
    }

Option
  = name:Identifier _ "=" _ value:Value {
      return { [name.name]: value.value };
    }

ThresholdSpec
  = "ABOVE"i __ value:NumberValue {
      return { type: 'above', value: value.value };
    }
  / "BELOW"i __ value:NumberValue {
      return { type: 'below', value: value.value };
    }
  / "BETWEEN"i __ min:NumberValue __ "AND"i __ max:NumberValue {
      return { type: 'between', min: min.value, max: max.value };
    }

// ============================================================================
// FIELD REFERENCES - Standard and Retainer Fields
// ============================================================================

FieldReference
  = StandardField
  / RetainerField

StandardField
  = "year"i { return createIdentifier('year'); }
  / "month"i { return createIdentifier('month'); }
  / "week"i { return createIdentifier('week'); }
  / "date"i { return createIdentifier('date'); }
  / "project"i { return createIdentifier('project'); }
  / "client"i { return createIdentifier('client'); }
  / "task"i { return createIdentifier('task'); }
  / "taskDescription"i { return createIdentifier('taskDescription'); }
  / "workOrder"i { return createIdentifier('workOrder'); }
  / "hours"i { return createIdentifier('hours'); }
  / "rate"i { return createIdentifier('rate'); }
  / "invoiced"i { return createIdentifier('invoiced'); }
  / "revenue"i { return createIdentifier('revenue'); }
  / "progress"i { return createIdentifier('progress'); }
  / "utilization"i { return createIdentifier('utilization'); }
  / "remaining"i { return createIdentifier('remaining'); }
  / "label"i { return createIdentifier('label'); }
  / "period"i { return createIdentifier('period'); }
  / "budgetHours"i { return createIdentifier('budgetHours'); }
  / "budgetUsed"i { return createIdentifier('budgetUsed'); }
  / "budgetRemaining"i { return createIdentifier('budgetRemaining'); }
  / "budgetProgress"i { return createIdentifier('budgetProgress'); }
  / "category"i { return createIdentifier('category'); }
  / "tag"i { return createIdentifier('tag'); }
  / "efficiency"i { return createIdentifier('efficiency'); }

RetainerField
  = "service"i { return createIdentifier('service'); }
  / "service_mix"i { return createIdentifier('service_mix'); }
  / "rollover"i { return createIdentifier('rollover'); }
  / "rolloverHours"i { return createIdentifier('rolloverHours'); }
  / "banked"i { return createIdentifier('banked'); }
  / "allocated"i { return createIdentifier('allocated'); }
  / "burned"i { return createIdentifier('burned'); }
  / "response_time"i { return createIdentifier('response_time'); }
  / "satisfaction"i { return createIdentifier('satisfaction'); }
  / "value_delivered"i { return createIdentifier('value_delivered'); }
  / "health_score"i { return createIdentifier('health_score'); }
  / "forecast"i { return createIdentifier('forecast'); }
  / "retainerHours"i { return createIdentifier('retainerHours'); }
  / "contractValue"i { return createIdentifier('contractValue'); }
  / "usage"i { return createIdentifier('usage'); }
  / "value"i { return createIdentifier('value'); }
  / "impact"i { return createIdentifier('impact'); }

// ============================================================================
// VALUES AND PRIMITIVES
// ============================================================================

Value
  = DateValue
  / String
  / NumberValue
  / PercentageValue
  / RelativeDateValue

ValueList
  = first:Value rest:(_ "," _ value:Value { return value; })* {
      return [first, ...rest];
    }

ListValue
  = "(" _ values:ValueList _ ")" {
      return createList(values);
    }

DateValue
  = year:([0-9] [0-9] [0-9] [0-9]) "-" month:([0-9] [0-9]) "-" day:([0-9] [0-9]) {
      const dateStr = year.join('') + '-' + month.join('') + '-' + day.join('');
      return createLiteral(dateStr, 'date');
    }

RelativeDateValue
  = "today"i { return createLiteral('today', 'relative_date'); }
  / "yesterday"i { return createLiteral('yesterday', 'relative_date'); }
  / "last_month"i { return createLiteral('last_month', 'relative_date'); }

NumberValue
  = digits:[0-9]+ decimals:("." [0-9]+)? {
      const num = digits.join('') + (decimals ? decimals[0] + decimals[1].join('') : '');
      return createLiteral(parseFloat(num), 'number');
    }

PercentageValue
  = digits:[0-9]+ decimals:("." [0-9]+)? "%" {
      const num = digits.join('') + (decimals ? decimals[0] + decimals[1].join('') : '');
      return createLiteral(parseFloat(num), 'percentage');
    }

String
  = '"' chars:DoubleStringChar* '"' {
      return createLiteral(chars.join(''), 'string');
    }
  / "'" chars:SingleStringChar* "'" {
      return createLiteral(chars.join(''), 'string');
    }

DoubleStringChar
  = "\\" char:EscapeSequence { return char; }
  / [^"\\]

SingleStringChar
  = "\\" char:EscapeSequence { return char; }
  / [^'\\]

EscapeSequence
  = "\\" { return "\\"; }
  / "\"" { return "\""; }
  / "'" { return "'"; }
  / "n" { return "\n"; }
  / "r" { return "\r"; }
  / "t" { return "\t"; }

Identifier
  = !ReservedWord first:[a-zA-Z_] rest:[a-zA-Z0-9_]* {
      return createIdentifier(first + rest.join(''));
    }

ReservedWord
  = ("WHERE"i / "SHOW"i / "VIEW"i / "CHART"i / "PERIOD"i / "SIZE"i /
     "ORDER"i / "BY"i / "GROUP"i / "HAVING"i / "LIMIT"i / "OFFSET"i /
     "RETAINER"i / "SERVICE"i / "ROLLOVER"i / "UTILIZATION"i /
     "CONTRACT"i / "VALUE"i / "ALERT"i / "FORECAST"i /
     "AND"i / "OR"i / "IN"i / "NOT"i / "LIKE"i / "IS"i / "NULL"i /
     "BETWEEN"i / "AS"i / "FORMAT"i / "ASC"i / "DESC"i) !([a-zA-Z0-9_])

ComparisonOperator
  = "=" / "!=" / ">=" / "<=" / ">" / "<"
  / "CONTAINS"i { return 'contains'; }
  / "STARTS_WITH"i { return 'startsWith'; }
  / "ENDS_WITH"i { return 'endsWith'; }

// ============================================================================
// COMMENTS AND WHITESPACE
// ============================================================================

Comment
  = "//" [^\r\n]* { return { type: 'Comment' }; }
  / "/*" (!"*/" .)* "*/" { return { type: 'Comment' }; }

__ "required whitespace"
  = ([ \t\n\r] / Comment)+

_ "optional whitespace"
  = ([ \t\n\r] / Comment)*
