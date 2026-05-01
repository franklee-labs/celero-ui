import { Handle, Position, type NodeProps } from '@xyflow/react';
import './LogicNode.css';

type NodeData = Record<string, unknown>;

function computeConditionName(data: NodeData): string {
  const sign        = data.sign as string;
  const displayName = data.displayName as string | undefined;
  const field       = data.field as string | undefined;
  const value       = data.value as string | undefined;
  const valueType   = data.valueType as string | undefined;
  const expression  = data.expression as string | undefined;
  const list1       = data.list1 as string | undefined;
  const list2       = data.list2 as string | undefined;

  if (sign === 'CEL')    return expression ?? '';
  if (sign === 'EXISTS' || sign === 'ABSENT') {
    return field ? `${displayName ?? sign} ${field}` : '';
  }
  if (sign === 'INTERSECT' || sign === 'DISJOINT') {
    return (list1 && list2) ? `${list1} ${displayName ?? sign} ${list2}` : '';
  }

  if (!field && !value) return '';

  const op = sign === 'REGEX' ? sign : (displayName ?? sign);
  const v  = value ?? '';

  let val: string;
  switch (valueType) {
    case 'String': val = `str(${v})`;  break;
    case 'Number': val = `num(${v})`;  break;
    default:       val = v;
  }

  return `${field ?? ''} ${op} ${val}`.trim();
}

function ConditionSubLabel({ data }: { data: NodeData }) {
  const sign        = data.sign as string;
  const displayName = data.displayName as string | undefined;
  const field       = data.field as string | undefined;
  const value       = data.value as string | undefined;
  const valueType   = data.valueType as string | undefined;
  const expression  = data.expression as string | undefined;
  const list1       = data.list1 as string | undefined;
  const list2       = data.list2 as string | undefined;

  if (sign === 'CEL' && expression) {
    return <code className="node-code">{expression}</code>;
  }

  if ((sign === 'EXISTS' || sign === 'ABSENT') && field) {
    return (
      <code className="node-code node-expr">
        <span className="node-op">{displayName ?? sign} </span>
        <span className="node-key">{field}</span>
      </code>
    );
  }

  if ((sign === 'INTERSECT' || sign === 'DISJOINT') && (list1 || list2)) {
    return (
      <code className="node-code node-expr">
        <span className="node-key">{list1}</span>
        <span className="node-op"> {displayName ?? sign} </span>
        <span className="node-key">{list2}</span>
      </code>
    );
  }

  if (!field && !value) return null;

  const isString = valueType === 'String';
  const op = displayName ?? sign;

  return (
    <code className="node-code node-expr">
      {field && <span className="node-key">{field}</span>}
      {op    && <span className="node-op"> {op} </span>}
      {value !== undefined && (
        <span className="node-val">
          {isString && <span className="node-quote">"</span>}
          {value}
          {isString && <span className="node-quote">"</span>}
        </span>
      )}
    </code>
  );
}

function LogicNode({ data }: NodeProps) {
  const sign        = data.sign as string;
  const displayName = data.displayName as string | undefined;
  const nodeType    = data.type as string;
  const description = data.description as string | undefined;
  const name        = data.name as string | undefined;
  const field       = data.field as string | undefined;
  const expression  = data.expression as string | undefined;

  const isCondition      = nodeType === 'condition';
  const topLabel         = isCondition ? (displayName ?? sign) : sign;
  const generatedName    = isCondition ? computeConditionName(data as NodeData) : '';
  const list1            = data.list1 as string | undefined;
  const hasConditionData = isCondition && (!!field || !!expression || !!list1);
  const showUserName     = isCondition && !!name;

  const subLabel = isCondition
    ? (showUserName || hasConditionData ? true : description)
    : name;

  const hasTooltip = (!isCondition && !!name) || (isCondition && !!generatedName);

  return (
    <>
      <Handle type="target" position={Position.Top} />
      <div className={`logic-node-content${subLabel ? ' has-name' : ''}`}>
        <div className="logic-node-label"><span>{topLabel}</span></div>

        {subLabel && (
          <div className="logic-node-name">
            {isCondition && !showUserName && hasConditionData
              ? <ConditionSubLabel data={data as NodeData} />
              : (name || description)
            }
          </div>
        )}

        {hasTooltip && (
          <div className="node-tooltip">
            {isCondition
              ? <code className="tt-code">{generatedName}</code>
              : name
            }
          </div>
        )}
      </div>

      {!isCondition && <Handle type="source" position={Position.Bottom} />}
    </>
  );
}

export default LogicNode;
