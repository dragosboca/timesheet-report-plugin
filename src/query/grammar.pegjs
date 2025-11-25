// Peggy grammar for the timesheet query language
// This generates a parser that creates AST nodes compatible with ast.ts

{
  // Helper functions for AST node creation
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
      clauses: clauses || []
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
}

// Main query grammar
Query
  = _ clauses:(Clause _)* _
  {
    return createQuery(clauses.map(c => c[0]));
  }

Clause
  = WhereClause
  / ShowClause
  / ViewClause
  / ChartClause
  / PeriodClause
  / SizeClause

// WHERE clause with AND conditions
WhereClause
  = WHERE _ conditions:AndConditions
  {
    return createWhereClause(conditions);
  }

AndConditions
  = first:Condition rest:(_ AND _ @Condition)*
  {
    return [first, ...rest];
  }

Condition
  = BetweenCondition
  / ComparisonCondition
  / InCondition

BetweenCondition
  = field:Identifier _ BETWEEN _ start:Value _ AND _ end:Value
  {
    return createBinaryExpression(field, 'BETWEEN', createDateRange(start, end));
  }

ComparisonCondition
  = field:Identifier _ operator:ComparisonOperator _ value:Value
  {
    return createBinaryExpression(field, operator, value);
  }

InCondition
  = field:Identifier _ IN _ "(" _ items:ValueList _ ")"
  {
    return createBinaryExpression(field, 'IN', createList(items));
  }

ValueList
  = first:Value rest:(_ "," _ @Value)*
  {
    return [first, ...rest];
  }

ComparisonOperator
  = ">="
  / "<="
  / "!="
  / "="
  / ">"
  / "<"

// SHOW clause
ShowClause
  = SHOW _ fields:IdentifierList
  {
    return createShowClause(fields);
  }

IdentifierList
  = first:Identifier rest:(_ "," _ @Identifier)*
  {
    return [first, ...rest];
  }

// VIEW clause
ViewClause
  = VIEW _ viewType:ViewType
  {
    return createViewClause(viewType);
  }

ViewType
  = "summary"i { return 'summary'; }
  / "chart"i { return 'chart'; }
  / "table"i { return 'table'; }
  / "full"i { return 'full'; }

// CHART clause
ChartClause
  = CHART _ chartType:ChartType
  {
    return createChartClause(chartType);
  }

ChartType
  = "trend"i { return 'trend'; }
  / "monthly"i { return 'monthly'; }
  / "budget"i { return 'budget'; }

// PERIOD clause
PeriodClause
  = PERIOD _ period:PeriodType
  {
    return createPeriodClause(period);
  }

PeriodType
  = "current-year"i { return 'current-year'; }
  / "all-time"i { return 'all-time'; }
  / "last-6-months"i { return 'last-6-months'; }
  / "last-12-months"i { return 'last-12-months'; }

// SIZE clause
SizeClause
  = SIZE _ size:SizeType
  {
    return createSizeClause(size);
  }

SizeType
  = "compact"i { return 'compact'; }
  / "normal"i { return 'normal'; }
  / "detailed"i { return 'detailed'; }

// Values
Value
  = Date
  / String
  / Number
  / Identifier

String
  = '"' chars:StringChar* '"'
  {
    const value = chars.join('');
    // Check if it's a date format (YYYY-MM-DD) inside quotes
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    return createLiteral(value, dateRegex.test(value) ? 'date' : 'string');
  }
  / "'" chars:SingleQuoteStringChar* "'"
  {
    const value = chars.join('');
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    return createLiteral(value, dateRegex.test(value) ? 'date' : 'string');
  }

StringChar
  = !'"' !"\\" char:.
  {
    return char;
  }
  / "\\" char:.
  {
    // Handle escape sequences
    switch(char) {
      case 'n': return '\n';
      case 't': return '\t';
      case 'r': return '\r';
      case '\\': return '\\';
      case '"': return '"';
      default: return char;
    }
  }

SingleQuoteStringChar
  = !"'" !"\\" char:.
  {
    return char;
  }
  / "\\" char:.
  {
    switch(char) {
      case 'n': return '\n';
      case 't': return '\t';
      case 'r': return '\r';
      case '\\': return '\\';
      case "'": return "'";
      default: return char;
    }
  }

Date
  = '"' year:([0-9][0-9][0-9][0-9]) "-" month:([0-9][0-9]) "-" day:([0-9][0-9]) '"'
  {
    const dateStr = year.join('') + '-' + month.join('') + '-' + day.join('');
    return createLiteral(dateStr, 'date');
  }

Number
  = digits:[0-9]+ "." decimals:[0-9]+
  {
    return createLiteral(digits.join('') + '.' + decimals.join(''), 'number');
  }
  / digits:[0-9]+
  {
    return createLiteral(digits.join(''), 'number');
  }

Identifier
  = !ReservedWord first:[a-zA-Z_] rest:[a-zA-Z0-9_-]*
  {
    return createIdentifier(first + rest.join(''));
  }

// Keywords (case insensitive) - must be followed by whitespace or end of input
ReservedWord
  = WHERE ![a-zA-Z0-9_-]
  / SHOW ![a-zA-Z0-9_-]
  / VIEW ![a-zA-Z0-9_-]
  / CHART ![a-zA-Z0-9_-]
  / PERIOD ![a-zA-Z0-9_-]
  / SIZE ![a-zA-Z0-9_-]
  / BETWEEN ![a-zA-Z0-9_-]
  / AND ![a-zA-Z0-9_-]
  / OR ![a-zA-Z0-9_-]
  / IN ![a-zA-Z0-9_-]

WHERE = "WHERE"i
SHOW = "SHOW"i
VIEW = "VIEW"i
CHART = "CHART"i
PERIOD = "PERIOD"i
SIZE = "SIZE"i
BETWEEN = "BETWEEN"i
AND = "AND"i
OR = "OR"i
IN = "IN"i

// Comments and whitespace
_
  = (Comment / Whitespace)*

Comment
  = "//" [^\n\r]*

Whitespace
  = [ \t\n\r]+
