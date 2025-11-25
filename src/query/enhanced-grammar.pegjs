// Enhanced grammar extension for advanced SHOW clause features
// Extends the base grammar with column aliases, formatting, and calculations

{
  // Enhanced helper functions for advanced column features
  function createEnhancedShowClause(fields) {
    return {
      type: 'EnhancedShowClause',
      fields: fields
    };
  }

  function createEnhancedField(expression, alias, format, aggregation) {
    return {
      type: 'EnhancedField',
      expression: expression,
      alias: alias,
      format: format,
      aggregation: aggregation
    };
  }

  function createCalculatedField(operator, left, right) {
    return {
      type: 'CalculatedField',
      operator: operator,
      left: left,
      right: right
    };
  }

  function createAggregationFunction(func, field) {
    return {
      type: 'AggregationFunction',
      function: func,
      field: field
    };
  }

  function createFormatSpecifier(formatType, options) {
    return {
      type: 'FormatSpecifier',
      formatType: formatType,
      options: options
    };
  }

  function createColumnAlias(name) {
    return {
      type: 'ColumnAlias',
      name: name
    };
  }
}

// Enhanced SHOW clause with advanced features
EnhancedShowClause
  = "SHOW"i _ fields:EnhancedFieldList {
      return createEnhancedShowClause(fields);
    }

EnhancedFieldList
  = first:EnhancedField rest:(_ "," _ field:EnhancedField { return field; })* {
      return [first, ...rest];
    }

// Enhanced field definition with aliases, formatting, and calculations
EnhancedField
  = expr:FieldExpression alias:ColumnAlias? format:FormatClause? {
      return createEnhancedField(expr, alias, format, null);
    }
  / aggr:AggregationFunction alias:ColumnAlias? format:FormatClause? {
      return createEnhancedField(aggr, alias, format, aggr.function);
    }

// Field expressions (identifiers, calculations, functions)
FieldExpression
  = CalculatedExpression
  / Identifier

// Calculated expressions for derived fields
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
  / Number
  / Identifier

// Aggregation functions
AggregationFunction
  = func:AggregationName "(" _ field:Identifier _ ")" {
      return createAggregationFunction(func, field);
    }

AggregationName
  = "SUM"i { return 'sum'; }
  / "AVG"i { return 'avg'; }
  / "COUNT"i { return 'count'; }
  / "MIN"i { return 'min'; }
  / "MAX"i { return 'max'; }
  / "TOTAL"i { return 'sum'; }
  / "AVERAGE"i { return 'avg'; }

// Column aliases
ColumnAlias
  = _ "AS"i _ alias:QuotedString { return createColumnAlias(alias); }
  / _ "AS"i _ alias:Identifier { return createColumnAlias(alias.name); }

// Format specifications
FormatClause
  = _ "FORMAT"i _ format:FormatSpecifier { return format; }

FormatSpecifier
  = type:FormatType options:FormatOptions? {
      return createFormatSpecifier(type, options);
    }

FormatType
  = "CURRENCY"i { return 'currency'; }
  / "MONEY"i { return 'currency'; }
  / "PERCENT"i { return 'percentage'; }
  / "PERCENTAGE"i { return 'percentage'; }
  / "HOURS"i { return 'hours'; }
  / "TIME"i { return 'hours'; }
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
  = "DECIMALS"i _ "=" _ decimals:Number { return { decimals: decimals }; }
  / "PRECISION"i _ "=" _ precision:Number { return { precision: precision }; }
  / "CURRENCY"i _ "=" _ currency:QuotedString { return { currency: currency }; }
  / "SYMBOL"i _ "=" _ symbol:QuotedString { return { symbol: symbol }; }
  / "LOCALE"i _ "=" _ locale:QuotedString { return { locale: locale }; }

// Enhanced WHERE clause with more operators and functions
EnhancedWhereClause
  = "WHERE"i _ conditions:EnhancedConditionList {
      return {
        type: 'EnhancedWhereClause',
        conditions: conditions
      };
    }

EnhancedConditionList
  = first:EnhancedCondition rest:(_ "AND"i _ condition:EnhancedCondition { return condition; })* {
      return [first, ...rest];
    }

EnhancedCondition
  = left:FieldExpression _ operator:EnhancedOperator _ right:ConditionValue {
      return {
        type: 'EnhancedBinaryExpression',
        left: left,
        operator: operator,
        right: right
      };
    }
  / field:Identifier _ "IN"i _ "(" _ values:ValueList _ ")" {
      return {
        type: 'InExpression',
        field: field,
        values: values
      };
    }
  / field:Identifier _ "NOT"i _ "IN"i _ "(" _ values:ValueList _ ")" {
      return {
        type: 'NotInExpression',
        field: field,
        values: values
      };
    }
  / field:Identifier _ "LIKE"i _ pattern:QuotedString {
      return {
        type: 'LikeExpression',
        field: field,
        pattern: pattern
      };
    }
  / field:Identifier _ "IS"i _ "NULL"i {
      return {
        type: 'IsNullExpression',
        field: field,
        isNull: true
      };
    }
  / field:Identifier _ "IS"i _ "NOT"i _ "NULL"i {
      return {
        type: 'IsNullExpression',
        field: field,
        isNull: false
      };
    }

EnhancedOperator
  = "=" / "!=" / ">=" / "<=" / ">" / "<"
  / "CONTAINS"i { return 'contains'; }
  / "STARTS_WITH"i { return 'startsWith'; }
  / "ENDS_WITH"i { return 'endsWith'; }

ConditionValue
  = DateRange
  / QuotedString
  / Number
  / Identifier

ValueList
  = first:ConditionValue rest:(_ "," _ value:ConditionValue { return value; })* {
      return [first, ...rest];
    }

// ORDER BY clause for sorting results
OrderByClause
  = "ORDER"i _ "BY"i _ fields:OrderFieldList {
      return {
        type: 'OrderByClause',
        fields: fields
      };
    }

OrderFieldList
  = first:OrderField rest:(_ "," _ field:OrderField { return field; })* {
      return [first, ...rest];
    }

OrderField
  = field:Identifier _ direction:OrderDirection? {
      return {
        field: field,
        direction: direction || 'asc'
      };
    }

OrderDirection
  = "ASC"i { return 'asc'; }
  / "DESC"i { return 'desc'; }

// GROUP BY clause for aggregations
GroupByClause
  = "GROUP"i _ "BY"i _ fields:GroupFieldList {
      return {
        type: 'GroupByClause',
        fields: fields
      };
    }

GroupFieldList
  = first:Identifier rest:(_ "," _ field:Identifier { return field; })* {
      return [first, ...rest];
    }

// HAVING clause for filtered aggregations
HavingClause
  = "HAVING"i _ conditions:EnhancedConditionList {
      return {
        type: 'HavingClause',
        conditions: conditions
      };
    }

// LIMIT clause for result pagination
LimitClause
  = "LIMIT"i _ limit:Number offset:LimitOffset? {
      return {
        type: 'LimitClause',
        limit: limit,
        offset: offset || 0
      };
    }

LimitOffset
  = _ "OFFSET"i _ offset:Number { return offset; }

// Enhanced query structure
EnhancedQuery
  = clauses:EnhancedClause+ {
      return {
        type: 'EnhancedQuery',
        clauses: clauses
      };
    }

EnhancedClause
  = EnhancedWhereClause
  / EnhancedShowClause
  / ViewClause
  / ChartClause
  / PeriodClause
  / SizeClause
  / OrderByClause
  / GroupByClause
  / HavingClause
  / LimitClause
  / Comment

// Comments support
Comment
  = "//" [^\r\n]* { return { type: 'Comment' }; }
  / "/*" (!"*/" .)* "*/" { return { type: 'Comment' }; }

// Enhanced number parsing with decimals
Number
  = digits:[0-9]+ "." decimals:[0-9]+ {
      return parseFloat(digits.join('') + '.' + decimals.join(''));
    }
  / digits:[0-9]+ {
      return parseInt(digits.join(''), 10);
    }

// Enhanced string parsing with escape sequences
QuotedString
  = "\"" chars:DoubleStringChar* "\"" { return chars.join(''); }
  / "'" chars:SingleStringChar* "'" { return chars.join(''); }

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

// Enhanced identifier parsing
Identifier
  = first:[a-zA-Z_] rest:[a-zA-Z0-9_]* {
      return {
        type: 'Identifier',
        name: first + rest.join('')
      };
    }

// Date range parsing
DateRange
  = start:QuotedString _ "TO"i _ end:QuotedString {
      return {
        type: 'DateRange',
        start: { type: 'Literal', value: start, dataType: 'date' },
        end: { type: 'Literal', value: end, dataType: 'date' }
      };
    }
  / start:QuotedString _ "AND"i _ end:QuotedString {
      return {
        type: 'DateRange',
        start: { type: 'Literal', value: start, dataType: 'date' },
        end: { type: 'Literal', value: end, dataType: 'date' }
      };
    }

// Whitespace
_ "whitespace"
  = [ \t\n\r]*

// Required whitespace
__ "required whitespace"
  = [ \t\n\r]+
