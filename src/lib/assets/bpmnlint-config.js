function getAugmentedNamespace(n) {
  var f = n.default;
  if (typeof f == "function") {
    var a = function () {
      return f.apply(this, arguments);
    };
    a.prototype = f.prototype;
  } else a = {};
  Object.defineProperty(a, "__esModule", { value: true });
  Object.keys(n).forEach((k) => {
    var d = Object.getOwnPropertyDescriptor(n, k);
    Object.defineProperty(
      a,
      k,
      d.get
        ? d
        : {
            enumerable: true,
            get: () => n[k],
          }
    );
  });
  return a;
}

/**
 * A rule that checks that sequence flows outgoing from a
 * conditional forking gateway or activity are
 * either default flows _or_ have a condition attached
 */

var conditionalFlows = () => {
  function check(node, reporter) {
    if (!isConditionalForking(node)) {
      return;
    }

    const outgoing = node.outgoing || [];

    outgoing.forEach((flow) => {
      const missingCondition = !hasCondition$2(flow) && !isDefaultFlow$1(node, flow);

      if (missingCondition) {
        reporter.report(flow.id, "Sequence flow is missing condition", ["conditionExpression"]);
      }
    });
  }

  return {
    check,
  };
};

// helpers /////////////////////////////

function isConditionalForking(node) {
  const defaultFlow = node["default"];
  const outgoing = node.outgoing || [];

  return defaultFlow || outgoing.find(hasCondition$2);
}

function hasCondition$2(flow) {
  return !!flow.conditionExpression;
}

function isDefaultFlow$1(node, flow) {
  return node["default"] === flow;
}

/**
 * Checks whether node is of specific bpmn type.
 *
 * @param {ModdleElement} node
 * @param {String} type
 *
 * @return {Boolean}
 */
function is$j(node, type) {
  if (type.indexOf(":") === -1) {
    type = "bpmn:" + type;
  }

  return typeof node.$instanceOf === "function" ? node.$instanceOf(type) : node.$type === type;
}

/**
 * Checks whether node has any of the specified types.
 *
 * @param {ModdleElement} node
 * @param {Array<String>} types
 *
 * @return {Boolean}
 */
function isAny$a(node, types) {
  return types.some((type) => is$j(node, type));
}

var index_esm = /*#__PURE__*/ Object.freeze({
  __proto__: null,
  is: is$j,
  isAny: isAny$a,
});

var require$$0 = /*@__PURE__*/ getAugmentedNamespace(index_esm);

const { is: is$i, isAny: isAny$9 } = require$$0;

/**
 * A rule that checks the presence of an end event per scope.
 */
var endEventRequired = () => {
  function hasEndEvent(node) {
    const flowElements = node.flowElements || [];

    return flowElements.some((node) => is$i(node, "bpmn:EndEvent"));
  }

  function check(node, reporter) {
    if (!isAny$9(node, ["bpmn:Process", "bpmn:SubProcess"])) {
      return;
    }

    if (!hasEndEvent(node)) {
      const type = is$i(node, "bpmn:SubProcess") ? "Sub process" : "Process";

      reporter.report(node.id, type + " is missing end event");
    }
  }

  return { check };
};

const { is: is$h } = require$$0;

/**
 * A rule that checks that start events inside an event sub-process
 * are typed.
 */
var eventSubProcessTypedStartEvent = () => {
  function check(node, reporter) {
    if (!is$h(node, "bpmn:SubProcess") || !node.triggeredByEvent) {
      return;
    }

    const flowElements = node.flowElements || [];

    flowElements.forEach((flowElement) => {
      if (!is$h(flowElement, "bpmn:StartEvent")) {
        return false;
      }

      const eventDefinitions = flowElement.eventDefinitions || [];

      if (eventDefinitions.length === 0) {
        reporter.report(flowElement.id, "Start event is missing event definition", ["eventDefinitions"]);
      }
    });
  }

  return {
    check,
  };
};

const { isAny: isAny$8 } = require$$0;

/**
 * A rule that checks that no fake join is modeled by attempting
 * to give a task or event join semantics.
 *
 * Users should model a parallel joining gateway
 * to achieve the desired behavior.
 */
var fakeJoin = () => {
  function check(node, reporter) {
    if (!isAny$8(node, ["bpmn:Activity", "bpmn:Event"])) {
      return;
    }

    const incoming = node.incoming || [];

    if (incoming.length > 1) {
      reporter.report(node.id, "Incoming flows do not join");
    }
  }

  return {
    check,
  };
};

const { is: is$g, isAny: isAny$7 } = require$$0;

/**
 * A rule that verifies that global elements are properly used.
 *
 * Currently recognized global elements are:
 *
 *   * `bpmn:Error`
 *   * `bpmn:Escalation`
 *   * `bpmn:Message`
 *   * `bpmn:Signal`
 *
 * For each of these elements proper usage implies:
 *
 *   * element must have a name
 *   * element is referenced by at least one element
 *   * there exists only a single element per type with a given name
 */
var global = () => {
  function check(node, reporter) {
    if (!is$g(node, "bpmn:Definitions")) {
      return false;
    }

    const rootElements = getRootElements(node);

    const referencingElements = getReferencingElements(node);

    rootElements.forEach((rootElement) => {
      if (!hasName(rootElement)) {
        reporter.report(rootElement.id, "Element is missing name");
      }

      if (!isReferenced(rootElement, referencingElements)) {
        reporter.report(rootElement.id, "Element is unused");
      }

      if (!isUnique(rootElement, rootElements)) {
        reporter.report(rootElement.id, "Element name is not unique");
      }
    });
  }

  return {
    check,
  };

  // helpers /////////////////////////////

  function getRootElements(definitions) {
    return definitions.rootElements.filter((node) =>
      isAny$7(node, ["bpmn:Error", "bpmn:Escalation", "bpmn:Message", "bpmn:Signal"])
    );
  }

  function getReferencingElements(definitions) {
    const referencingElements = [];

    function traverse(element) {
      if (is$g(element, "bpmn:Definitions") && element.get("rootElements").length) {
        element.get("rootElements").forEach(traverse);
      }

      if (is$g(element, "bpmn:FlowElementsContainer") && element.get("flowElements").length) {
        element.get("flowElements").forEach(traverse);
      }

      if (is$g(element, "bpmn:Event") && element.get("eventDefinitions").length) {
        element.get("eventDefinitions").forEach((eventDefinition) => referencingElements.push(eventDefinition));
      }

      if (is$g(element, "bpmn:Collaboration") && element.get("messageFlows").length) {
        element.get("messageFlows").forEach(traverse);
      }

      if (isAny$7(element, ["bpmn:MessageFlow", "bpmn:ReceiveTask", "bpmn:SendTask"])) {
        referencingElements.push(element);
      }
    }

    traverse(definitions);

    return referencingElements;
  }

  function hasName(event) {
    return event.name?.trim() !== "";
  }

  function isReferenced(rootElement, referencingElements) {
    if (is$g(rootElement, "bpmn:Error")) {
      return referencingElements.some((referencingElement) => {
        return (
          is$g(referencingElement, "bpmn:ErrorEventDefinition") &&
          rootElement.get("id") === referencingElement.get("errorRef")?.get("id")
        );
      });
    }

    if (is$g(rootElement, "bpmn:Escalation")) {
      return referencingElements.some((referencingElement) => {
        return (
          is$g(referencingElement, "bpmn:EscalationEventDefinition") &&
          rootElement.get("id") === referencingElement.get("escalationRef")?.get("id")
        );
      });
    }

    if (is$g(rootElement, "bpmn:Message")) {
      return referencingElements.some((referencingElement) => {
        return (
          isAny$7(referencingElement, [
            "bpmn:MessageEventDefinition",
            "bpmn:MessageFlow",
            "bpmn:ReceiveTask",
            "bpmn:SendTask",
          ]) && rootElement.get("id") === referencingElement.get("messageRef")?.get("id")
        );
      });
    }

    if (is$g(rootElement, "bpmn:Signal")) {
      return referencingElements.some((referencingElement) => {
        return (
          is$g(referencingElement, "bpmn:SignalEventDefinition") &&
          rootElement.get("id") === referencingElement.get("signalRef")?.get("id")
        );
      });
    }
  }

  function isUnique(rootElement, rootElements) {
    return (
      rootElements.filter(
        (otherRootElement) => is$g(otherRootElement, rootElement.$type) && rootElement.name === otherRootElement.name
      ).length === 1
    );
  }
};

const { is: is$f, isAny: isAny$6 } = require$$0;

/**
 * A rule that checks the presence of a label.
 */
var labelRequired = () => {
  function check(node, reporter) {
    if (isAny$6(node, ["bpmn:ParallelGateway", "bpmn:EventBasedGateway"])) {
      return;
    }

    // ignore joining gateways
    if (is$f(node, "bpmn:Gateway") && !isForking(node)) {
      return;
    }

    // ignore sub-processes
    if (is$f(node, "bpmn:SubProcess")) {
      // TODO(nikku): better ignore expanded sub-processes only
      return;
    }

    // ignore sequence flow without condition
    if (is$f(node, "bpmn:SequenceFlow") && !hasCondition$1(node)) {
      return;
    }

    // ignore data objects and artifacts for now
    if (isAny$6(node, ["bpmn:FlowNode", "bpmn:SequenceFlow", "bpmn:Participant", "bpmn:Lane"])) {
      const name = (node.name || "").trim();

      if (name.length === 0) {
        reporter.report(node.id, "Element is missing label/name", ["name"]);
      }
    }
  }

  return { check };
};

// helpers ////////////////////////

function isForking(node) {
  const outgoing = node.outgoing || [];

  return outgoing.length > 1;
}

function hasCondition$1(node) {
  return node.conditionExpression;
}

var dist = {};

/**
 * Flatten array, one level deep.
 *
 * @template T
 *
 * @param {T[][] | T[] | null} [arr]
 *
 * @return {T[]}
 */
function flatten$1(arr) {
  return Array.prototype.concat.apply([], arr);
}

const nativeToString = Object.prototype.toString;
const nativeHasOwnProperty = Object.prototype.hasOwnProperty;

function isUndefined(obj) {
  return obj === undefined;
}

function isDefined(obj) {
  return obj !== undefined;
}

function isNil(obj) {
  return obj == null;
}

function isArray(obj) {
  return nativeToString.call(obj) === "[object Array]";
}

function isObject(obj) {
  return nativeToString.call(obj) === "[object Object]";
}

function isNumber(obj) {
  return nativeToString.call(obj) === "[object Number]";
}

/**
 * @param {any} obj
 *
 * @return {boolean}
 */
function isFunction(obj) {
  const tag = nativeToString.call(obj);

  return (
    tag === "[object Function]" ||
    tag === "[object AsyncFunction]" ||
    tag === "[object GeneratorFunction]" ||
    tag === "[object AsyncGeneratorFunction]" ||
    tag === "[object Proxy]"
  );
}

function isString(obj) {
  return nativeToString.call(obj) === "[object String]";
}

/**
 * Ensure collection is an array.
 *
 * @param {Object} obj
 */
function ensureArray(obj) {
  if (isArray(obj)) {
    return;
  }

  throw new Error("must supply array");
}

/**
 * Return true, if target owns a property with the given key.
 *
 * @param {Object} target
 * @param {String} key
 *
 * @return {Boolean}
 */
function has(target, key) {
  return !isNil(target) && nativeHasOwnProperty.call(target, key);
}

/**
 * @template T
 * @typedef { (
 *   ((e: T) => boolean) |
 *   ((e: T, idx: number) => boolean) |
 *   ((e: T, key: string) => boolean) |
 *   string |
 *   number
 * ) } Matcher
 */

/**
 * @template T
 * @template U
 *
 * @typedef { (
 *   ((e: T) => U) | string | number
 * ) } Extractor
 */

/**
 * @template T
 * @typedef { (val: T, key: any) => boolean } MatchFn
 */

/**
 * @template T
 * @typedef { T[] } ArrayCollection
 */

/**
 * @template T
 * @typedef { { [key: string]: T } } StringKeyValueCollection
 */

/**
 * @template T
 * @typedef { { [key: number]: T } } NumberKeyValueCollection
 */

/**
 * @template T
 * @typedef { StringKeyValueCollection<T> | NumberKeyValueCollection<T> } KeyValueCollection
 */

/**
 * @template T
 * @typedef { KeyValueCollection<T> | ArrayCollection<T> } Collection
 */

/**
 * Find element in collection.
 *
 * @template T
 * @param {Collection<T>} collection
 * @param {Matcher<T>} matcher
 *
 * @return {Object}
 */
function find(collection, matcher) {
  const matchFn = toMatcher(matcher);

  let match;

  forEach(collection, (val, key) => {
    if (matchFn(val, key)) {
      match = val;

      return false;
    }
  });

  return match;
}

/**
 * Find element index in collection.
 *
 * @template T
 * @param {Collection<T>} collection
 * @param {Matcher<T>} matcher
 *
 * @return {number | string | undefined}
 */
function findIndex(collection, matcher) {
  const matchFn = toMatcher(matcher);

  let idx = isArray(collection) ? -1 : undefined;

  forEach(collection, (val, key) => {
    if (matchFn(val, key)) {
      idx = key;

      return false;
    }
  });

  return idx;
}

/**
 * Filter elements in collection.
 *
 * @template T
 * @param {Collection<T>} collection
 * @param {Matcher<T>} matcher
 *
 * @return {T[]} result
 */
function filter(collection, matcher) {
  const matchFn = toMatcher(matcher);

  const result = [];

  forEach(collection, (val, key) => {
    if (matchFn(val, key)) {
      result.push(val);
    }
  });

  return result;
}

/**
 * Iterate over collection; returning something
 * (non-undefined) will stop iteration.
 *
 * @template T
 * @param {Collection<T>} collection
 * @param { ((item: T, idx: number) => (boolean|void)) | ((item: T, key: string) => (boolean|void)) } iterator
 *
 * @return {T} return result that stopped the iteration
 */
function forEach(collection, iterator) {
  let val, result;

  if (isUndefined(collection)) {
    return;
  }

  const convertKey = isArray(collection) ? toNum : identity;

  for (const key in collection) {
    if (has(collection, key)) {
      val = collection[key];

      result = iterator(val, convertKey(key));

      if (result === false) {
        return val;
      }
    }
  }
}

/**
 * Return collection without element.
 *
 * @template T
 * @param {ArrayCollection<T>} arr
 * @param {Matcher<T>} matcher
 *
 * @return {T[]}
 */
function without(arr, matcher) {
  if (isUndefined(arr)) {
    return [];
  }

  ensureArray(arr);

  const matchFn = toMatcher(matcher);

  return arr.filter((el, idx) => !matchFn(el, idx));
}

/**
 * Reduce collection, returning a single result.
 *
 * @template T
 * @template V
 *
 * @param {Collection<T>} collection
 * @param {(result: V, entry: T, index: any) => V} iterator
 * @param {V} result
 *
 * @return {V} result returned from last iterator
 */
function reduce(collection, iterator, result) {
  forEach(collection, (value, idx) => {
    result = iterator(result, value, idx);
  });

  return result;
}

/**
 * Return true if every element in the collection
 * matches the criteria.
 *
 * @param  {Object|Array} collection
 * @param  {Function} matcher
 *
 * @return {Boolean}
 */
function every(collection, matcher) {
  return !!reduce(collection, (matches, val, key) => matches && matcher(val, key), true);
}

/**
 * Return true if some elements in the collection
 * match the criteria.
 *
 * @param  {Object|Array} collection
 * @param  {Function} matcher
 *
 * @return {Boolean}
 */
function some(collection, matcher) {
  return !!find(collection, matcher);
}

/**
 * Transform a collection into another collection
 * by piping each member through the given fn.
 *
 * @param  {Object|Array}   collection
 * @param  {Function} fn
 *
 * @return {Array} transformed collection
 */
function map(collection, fn) {
  const result = [];

  forEach(collection, (val, key) => {
    result.push(fn(val, key));
  });

  return result;
}

/**
 * Get the collections keys.
 *
 * @param  {Object|Array} collection
 *
 * @return {Array}
 */
function keys(collection) {
  return (collection && Object.keys(collection)) || [];
}

/**
 * Shorthand for `keys(o).length`.
 *
 * @param  {Object|Array} collection
 *
 * @return {Number}
 */
function size(collection) {
  return keys(collection).length;
}

/**
 * Get the values in the collection.
 *
 * @param  {Object|Array} collection
 *
 * @return {Array}
 */
function values(collection) {
  return map(collection, (val) => val);
}

/**
 * Group collection members by attribute.
 *
 * @param {Object|Array} collection
 * @param {Extractor} extractor
 *
 * @return {Object} map with { attrValue => [ a, b, c ] }
 */
function groupBy$1(collection, extractor, grouped = {}) {
  extractor = toExtractor(extractor);

  forEach(collection, (val) => {
    const discriminator = extractor(val) || "_";

    let group = grouped[discriminator];

    if (!group) {
      group = grouped[discriminator] = [];
    }

    group.push(val);
  });

  return grouped;
}

function uniqueBy(extractor, ...collections) {
  extractor = toExtractor(extractor);

  const grouped = {};

  forEach(collections, (c) => groupBy$1(c, extractor, grouped));

  const result = map(grouped, (val, key) => val[0]);

  return result;
}

const unionBy = uniqueBy;

/**
 * Sort collection by criteria.
 *
 * @template T
 *
 * @param {Collection<T>} collection
 * @param {Extractor<T, number | string>} extractor
 *
 * @return {Array}
 */
function sortBy(collection, extractor) {
  extractor = toExtractor(extractor);

  const sorted = [];

  forEach(collection, (value, key) => {
    const disc = extractor(value, key);

    const entry = {
      d: disc,
      v: value,
    };

    for (var idx = 0; idx < sorted.length; idx++) {
      const { d } = sorted[idx];

      if (disc < d) {
        sorted.splice(idx, 0, entry);
        return;
      }
    }

    // not inserted, append (!)
    sorted.push(entry);
  });

  return map(sorted, (e) => e.v);
}

/**
 * Create an object pattern matcher.
 *
 * @example
 *
 * ```javascript
 * const matcher = matchPattern({ id: 1 });
 *
 * let element = find(elements, matcher);
 * ```
 *
 * @template T
 *
 * @param {T} pattern
 *
 * @return { (el: any) =>  boolean } matcherFn
 */
function matchPattern(pattern) {
  return (el) => every(pattern, (val, key) => el[key] === val);
}

/**
 * @param {string | ((e: any) => any) } extractor
 *
 * @return { (e: any) => any }
 */
function toExtractor(extractor) {
  /**
   * @satisfies { (e: any) => any }
   */
  return isFunction(extractor)
    ? extractor
    : (e) => {
        // @ts-ignore: just works
        return e[extractor];
      };
}

/**
 * @template T
 * @param {Matcher<T>} matcher
 *
 * @return {MatchFn<T>}
 */
function toMatcher(matcher) {
  return isFunction(matcher)
    ? matcher
    : (e) => {
        return e === matcher;
      };
}

function identity(arg) {
  return arg;
}

function toNum(arg) {
  return Number(arg);
}

/* global setTimeout clearTimeout */

/**
 * @typedef { {
 *   (...args: any[]): any;
 *   flush: () => void;
 *   cancel: () => void;
 * } } DebouncedFunction
 */

/**
 * Debounce fn, calling it only once if the given time
 * elapsed between calls.
 *
 * Lodash-style the function exposes methods to `#clear`
 * and `#flush` to control internal behavior.
 *
 * @param  {Function} fn
 * @param  {Number} timeout
 *
 * @return {DebouncedFunction} debounced function
 */
function debounce(fn, timeout) {
  let timer;

  let lastArgs;
  let lastThis;

  let lastNow;

  function fire(force) {
    const now = Date.now();

    const scheduledDiff = force ? 0 : lastNow + timeout - now;

    if (scheduledDiff > 0) {
      return schedule(scheduledDiff);
    }

    fn.apply(lastThis, lastArgs);

    clear();
  }

  function schedule(timeout) {
    timer = setTimeout(fire, timeout);
  }

  function clear() {
    if (timer) {
      clearTimeout(timer);
    }

    timer = lastNow = lastArgs = lastThis = undefined;
  }

  function flush() {
    if (timer) {
      fire(true);
    }

    clear();
  }

  /**
   * @type { DebouncedFunction }
   */
  function callback(...args) {
    lastNow = Date.now();

    lastArgs = args;
    lastThis = this;

    // ensure an execution is scheduled
    if (!timer) {
      schedule(timeout);
    }
  }

  callback.flush = flush;
  callback.cancel = clear;

  return callback;
}

/**
 * Throttle fn, calling at most once
 * in the given interval.
 *
 * @param  {Function} fn
 * @param  {Number} interval
 *
 * @return {Function} throttled function
 */
function throttle(fn, interval) {
  let throttling = false;

  return (...args) => {
    if (throttling) {
      return;
    }

    fn(...args);
    throttling = true;

    setTimeout(() => {
      throttling = false;
    }, interval);
  };
}

/**
 * Bind function against target <this>.
 *
 * @param  {Function} fn
 * @param  {Object}   target
 *
 * @return {Function} bound function
 */
function bind(fn, target) {
  return fn.bind(target);
}

/**
 * Convenience wrapper for `Object.assign`.
 *
 * @param {Object} target
 * @param {...Object} others
 *
 * @return {Object} the target
 */
function assign(target, ...others) {
  return Object.assign(target, ...others);
}

/**
 * Sets a nested property of a given object to the specified value.
 *
 * This mutates the object and returns it.
 *
 * @template T
 *
 * @param {T} target The target of the set operation.
 * @param {(string|number)[]} path The path to the nested value.
 * @param {any} value The value to set.
 *
 * @return {T}
 */
function set(target, path, value) {
  let currentTarget = target;

  forEach(path, (key, idx) => {
    if (typeof key !== "number" && typeof key !== "string") {
      throw new Error("illegal key type: " + typeof key + ". Key should be of type number or string.");
    }

    if (key === "constructor") {
      throw new Error("illegal key: constructor");
    }

    if (key === "__proto__") {
      throw new Error("illegal key: __proto__");
    }

    const nextKey = path[idx + 1];
    let nextTarget = currentTarget[key];

    if (isDefined(nextKey) && isNil(nextTarget)) {
      nextTarget = currentTarget[key] = isNaN(+nextKey) ? {} : [];
    }

    if (isUndefined(nextKey)) {
      if (isUndefined(value)) {
        delete currentTarget[key];
      } else {
        currentTarget[key] = value;
      }
    } else {
      currentTarget = nextTarget;
    }
  });

  return target;
}

/**
 * Gets a nested property of a given object.
 *
 * @param {Object} target The target of the get operation.
 * @param {(string|number)[]} path The path to the nested value.
 * @param {any} [defaultValue] The value to return if no value exists.
 *
 * @return {any}
 */
function get(target, path, defaultValue) {
  let currentTarget = target;

  forEach(path, (key) => {
    // accessing nil property yields <undefined>
    if (isNil(currentTarget)) {
      currentTarget = undefined;

      return false;
    }

    currentTarget = currentTarget[key];
  });

  return isUndefined(currentTarget) ? defaultValue : currentTarget;
}

/**
 * Pick properties from the given target.
 *
 * @template T
 * @template {any[]} V
 *
 * @param {T} target
 * @param {V} properties
 *
 * @return Pick<T, V>
 */
function pick(target, properties) {
  const result = {};

  const obj = Object(target);

  forEach(properties, (prop) => {
    if (prop in obj) {
      result[prop] = target[prop];
    }
  });

  return result;
}

/**
 * Pick all target properties, excluding the given ones.
 *
 * @template T
 * @template {any[]} V
 *
 * @param {T} target
 * @param {V} properties
 *
 * @return {Omit<T, V>} target
 */
function omit(target, properties) {
  const result = {};

  const obj = Object(target);

  forEach(obj, (prop, key) => {
    if (properties.indexOf(key) === -1) {
      result[key] = prop;
    }
  });

  return result;
}

/**
 * Recursively merge `...sources` into given target.
 *
 * Does support merging objects; does not support merging arrays.
 *
 * @param {Object} target
 * @param {...Object} sources
 *
 * @return {Object} the target
 */
function merge(target, ...sources) {
  if (!sources.length) {
    return target;
  }

  forEach(sources, (source) => {
    // skip non-obj sources, i.e. null
    if (!source || !isObject(source)) {
      return;
    }

    forEach(source, (sourceVal, key) => {
      if (key === "__proto__") {
        return;
      }

      let targetVal = target[key];

      if (isObject(sourceVal)) {
        if (!isObject(targetVal)) {
          // override target[key] with object
          targetVal = {};
        }

        target[key] = merge(targetVal, sourceVal);
      } else {
        target[key] = sourceVal;
      }
    });
  });

  return target;
}

dist.assign = assign;
dist.bind = bind;
dist.debounce = debounce;
dist.ensureArray = ensureArray;
dist.every = every;
dist.filter = filter;
dist.find = find;
dist.findIndex = findIndex;
dist.flatten = flatten$1;
dist.forEach = forEach;
dist.get = get;
dist.groupBy = groupBy$1;
dist.has = has;
dist.isArray = isArray;
dist.isDefined = isDefined;
dist.isFunction = isFunction;
dist.isNil = isNil;
dist.isNumber = isNumber;
dist.isObject = isObject;
dist.isString = isString;
dist.isUndefined = isUndefined;
dist.keys = keys;
dist.map = map;
dist.matchPattern = matchPattern;
dist.merge = merge;
dist.omit = omit;
dist.pick = pick;
dist.reduce = reduce;
dist.set = set;
dist.size = size;
dist.some = some;
dist.sortBy = sortBy;
dist.throttle = throttle;
dist.unionBy = unionBy;
dist.uniqueBy = uniqueBy;
dist.values = values;
dist.without = without;

const { groupBy } = dist;

const { is: is$e } = require$$0;

/**
 * A rule that verifies that link events are properly used.
 *
 * This implies:
 *
 *   * for every link throw there exists a link catch within
 *     the same scope, and vice versa
 *   * there exists only a single pair of [ throw, catch ] links
 *     with a given name, per scope
 *   * link events have a name
 *
 */
var linkEvent = () => {
  function check(node, reporter) {
    if (!is$e(node, "bpmn:FlowElementsContainer")) {
      return;
    }

    const links = (node.flowElements || []).filter(isLinkEvent);

    for (const link of links) {
      if (!link.name) {
        reporter.report(link.id, "Link event is missing name");
      }
    }

    const names = groupBy(links, (link) => link.name);

    for (const [name, events] of Object.entries(names)) {
      // ignore unnamed (validated earlier)
      if (!name) {
        continue;
      }

      // missing catch or throw event
      if (events.length === 1) {
        const event = events[0];

        reporter.report(
          event.id,
          `Link ${isThrowEvent(event) ? "catch" : "throw"} event with name <${name}> missing in scope`
        );
      }

      const throwEvents = events.filter(isThrowEvent);

      if (throwEvents.length > 1) {
        for (const event of throwEvents) {
          reporter.report(event.id, `Duplicate link throw event with name <${name}> in scope`);
        }
      }

      const catchEvents = events.filter(isCatchEvent);

      if (catchEvents.length > 1) {
        for (const event of catchEvents) {
          reporter.report(event.id, `Duplicate link catch event with name <${name}> in scope`);
        }
      }
    }
  }

  return {
    check,
  };
};

// helpers /////////////////

function isLinkEvent(node) {
  var eventDefinitions = node.eventDefinitions || [];

  if (!is$e(node, "bpmn:Event")) {
    return false;
  }

  return eventDefinitions.some((definition) => is$e(definition, "bpmn:LinkEventDefinition"));
}

function isThrowEvent(node) {
  return is$e(node, "bpmn:ThrowEvent");
}

function isCatchEvent(node) {
  return is$e(node, "bpmn:CatchEvent");
}

const { is: is$d } = require$$0;

const { flatten } = dist;

/**
 * A rule that checks that there is no BPMNDI information missing for elements,
 * which require BPMNDI.
 */
var noBpmndi = () => {
  function check(node, reporter) {
    if (!is$d(node, "bpmn:Definitions")) {
      return false;
    }

    // (1) Construct array of all BPMN elements
    const bpmnElements = getAllBpmnElements(node.rootElements);

    // (2) Filter BPMN elements without visual representation
    const visualBpmnElements = bpmnElements.filter(hasVisualRepresentation);

    // (3) Construct array of BPMNDI references
    const diBpmnReferences = getAllDiBpmnReferences(node);

    // (4) Report elements without BPMNDI
    visualBpmnElements.forEach((element) => {
      if (diBpmnReferences.indexOf(element.id) === -1) {
        reporter.report(element.id, "Element is missing bpmndi");
      }
    });
  }

  return {
    check,
  };
};

// helpers /////////////////////////////

/**
 * Get all BPMN elements within a bpmn:Definitions node
 *
 * @param {array<ModdleElement>} rootElements - An array of Moddle rootElements
 * @return {array<Object>} A flat array with all BPMN elements, each represented with { id: elementId, $type: elementType }
 *
 */
function getAllBpmnElements(rootElements) {
  return flatten(
    rootElements.map((rootElement) => {
      const laneSet = (rootElement.laneSets && rootElement.laneSets[0]) || rootElement.childLaneSet;

      // Include
      // * flowElements (e.g., tasks, sequenceFlows),
      // * nested flowElements,
      // * participants,
      // * artifacts (groups),
      // * laneSets
      // * nested laneSets
      // * childLaneSets
      // * nested childLaneSets
      // * messageFlows
      const elements = flatten(
        [].concat(
          rootElement.flowElements || [],
          (rootElement.flowElements && getAllBpmnElements(rootElement.flowElements.filter(hasFlowElements))) || [],
          rootElement.participants || [],
          rootElement.artifacts || [],
          (laneSet && laneSet.lanes) || [],
          (laneSet && laneSet.lanes && getAllBpmnElements(laneSet.lanes.filter(hasChildLaneSet))) || [],
          rootElement.messageFlows || []
        )
      );

      if (elements.length > 0) {
        return elements.map((element) => {
          return {
            id: element.id,
            $type: element.$type,
          };
        });
      } else {
        // We are not interested in the rest here (DI)
        return [];
      }
    })
  );
}

/**
 * Get all BPMN elements within a bpmn:Definitions node
 *
 * @param {ModdleElement} definitionsNode - A moddleElement representing the
 * bpmn:Definitions element
 * @return {array<String>} A flat array with all BPMNDI element ids part of
 * this bpmn:Definitions node
 *
 */
function getAllDiBpmnReferences(definitionsNode) {
  return flatten(
    definitionsNode.get("diagrams").map((diagram) => {
      const diElements = diagram.plane.planeElement || [];

      return diElements.map((element) => {
        return element.bpmnElement?.id;
      });
    })
  );
}

function hasVisualRepresentation(element) {
  const noVisRepresentation = ["bpmn:DataObject"];

  return noVisRepresentation.includes(element.$type) ? false : true;
}

function hasFlowElements(element) {
  return element.flowElements ? true : false;
}

function hasChildLaneSet(element) {
  return element.childLaneSet ? true : false;
}

var helper = {};

const { is: is$c } = require$$0;

/**
 * Create a checker that disallows the given element type.
 *
 * @param {String} type
 *
 * @return {Function} ruleImpl
 */
function disallowNodeType$2(type) {
  return () => {
    function check(node, reporter) {
      if (is$c(node, type)) {
        reporter.report(node.id, "Element has disallowed type <" + type + ">");
      }
    }

    return {
      check,
    };
  };
}

helper.disallowNodeType = disallowNodeType$2;

/**
 * Find a parent for the given element
 *
 * @param {ModdleElement} node
 *
 *  @param {String} type
 *
 * @return {ModdleElement} element
 */

function findParent$1(node, type) {
  if (!node) {
    return null;
  }

  const parent = node.$parent;

  if (!parent) {
    return node;
  }

  if (is$c(parent, type)) {
    return parent;
  }

  return findParent$1(parent, type);
}

helper.findParent = findParent$1;

const disallowNodeType$1 = helper.disallowNodeType;

var noComplexGateway = disallowNodeType$1("bpmn:ComplexGateway");

const { isAny: isAny$5, is: is$b } = require$$0;

/**
 * A rule that verifies that there exists no disconnected
 * flow elements, i.e. elements without incoming
 * _or_ outgoing sequence flows
 */
var noDisconnected = () => {
  function check(node, reporter) {
    if (!isAny$5(node, ["bpmn:Task", "bpmn:Gateway", "bpmn:SubProcess", "bpmn:Event"]) || node.triggeredByEvent) {
      return;
    }

    // compensation activity and boundary events are
    // linked visually via associations. If these associations
    // exist we are fine, too
    if (isCompensationLinked(node)) {
      return;
    }

    const incoming = node.incoming || [];
    const outgoing = node.outgoing || [];

    if (!incoming.length && !outgoing.length) {
      reporter.report(node.id, "Element is not connected");
    }
  }

  return {
    check,
  };
};

// helpers /////////////////

function isCompensationBoundary(node) {
  var eventDefinitions = node.eventDefinitions;

  if (!is$b(node, "bpmn:BoundaryEvent")) {
    return false;
  }

  if (!eventDefinitions || eventDefinitions.length !== 1) {
    return false;
  }

  return is$b(eventDefinitions[0], "bpmn:CompensateEventDefinition");
}

function isCompensationActivity(node) {
  return node.isForCompensation;
}

function isCompensationLinked(node) {
  var source = isCompensationBoundary(node);
  var target = isCompensationActivity(node);

  // TODO(nikku): check, whether compensation association exists
  return source || target;
}

const { is: is$a } = require$$0;

/**
 * A rule that verifies that there are no disconnected
 * flow elements, i.e. elements without incoming
 * _or_ outgoing sequence flows
 */
var noDuplicateSequenceFlows = () => {
  const keyed = {};

  const outgoingReported = {};
  const incomingReported = {};

  function check(node, reporter) {
    if (!is$a(node, "bpmn:SequenceFlow")) {
      return;
    }

    const key = flowKey(node);

    if (key in keyed) {
      reporter.report(node.id, "SequenceFlow is a duplicate");

      const sourceId = node.sourceRef.id;
      const targetId = node.targetRef.id;

      if (!outgoingReported[sourceId]) {
        reporter.report(sourceId, "Duplicate outgoing sequence flows");

        outgoingReported[sourceId] = true;
      }

      if (!incomingReported[targetId]) {
        reporter.report(targetId, "Duplicate incoming sequence flows");

        incomingReported[targetId] = true;
      }
    } else {
      keyed[key] = node;
    }
  }

  return {
    check,
  };
};

// helpers /////////////////

function flowKey(flow) {
  const conditionExpression = flow.conditionExpression;

  const condition = conditionExpression ? conditionExpression.body : "";
  const source = flow.sourceRef ? flow.sourceRef.id : flow.id;
  const target = flow.targetRef ? flow.targetRef.id : flow.id;

  return source + "#" + target + "#" + condition;
}

const { is: is$9 } = require$$0;

/**
 * A rule that checks, whether a gateway forks and joins
 * at the same time.
 */
var noGatewayJoinFork = () => {
  function check(node, reporter) {
    if (!is$9(node, "bpmn:Gateway")) {
      return;
    }

    const incoming = node.incoming || [];
    const outgoing = node.outgoing || [];

    if (incoming.length > 1 && outgoing.length > 1) {
      reporter.report(node.id, "Gateway forks and joins");
    }
  }

  return {
    check,
  };
};

const { isAny: isAny$4 } = require$$0;

/**
 * A rule that checks that no implicit split is modeled
 * starting from a task.
 *
 * users should model the parallel splitting gateway
 * explicitly instead.
 */
var noImplicitSplit = () => {
  function check(node, reporter) {
    if (!isAny$4(node, ["bpmn:Activity", "bpmn:Event"])) {
      return;
    }

    const outgoing = node.outgoing || [];

    const outgoingWithoutCondition = outgoing.filter((flow) => {
      return !hasCondition(flow) && !isDefaultFlow(node, flow);
    });

    if (outgoingWithoutCondition.length > 1) {
      reporter.report(node.id, "Flow splits implicitly");
    }
  }

  return {
    check,
  };
};

// helpers /////////////////////////////

function hasCondition(flow) {
  return !!flow.conditionExpression;
}

function isDefaultFlow(node, flow) {
  return node["default"] === flow;
}

const { is: is$8, isAny: isAny$3 } = require$$0;

const { findParent } = helper;

/**
 * A rule that checks that an element is not an implicit end (token sink).
 */
var noImplicitEnd = () => {
  function isLinkEvent(node) {
    const eventDefinitions = node.eventDefinitions || [];

    return (
      eventDefinitions.length && eventDefinitions.every((definition) => is$8(definition, "bpmn:LinkEventDefinition"))
    );
  }

  function isCompensationEvent(node) {
    const eventDefinitions = node.eventDefinitions || [];

    return (
      eventDefinitions.length &&
      eventDefinitions.every((definition) => is$8(definition, "bpmn:CompensateEventDefinition"))
    );
  }

  function hasCompensationActivity(node) {
    const parent = findParent(node, "bpmn:Process");

    const artifacts = parent.artifacts || [];

    return artifacts.some((element) => {
      if (!is$8(element, "bpmn:Association")) {
        return false;
      }

      const source = element.sourceRef;

      return source.id === node.id;
    });
  }

  function isForCompensation(node) {
    return node.isForCompensation;
  }

  function isImplicitEnd(node) {
    const outgoing = node.outgoing || [];

    if (is$8(node, "bpmn:SubProcess") && node.triggeredByEvent) {
      return false;
    }

    if (is$8(node, "bpmn:IntermediateThrowEvent") && isLinkEvent(node)) {
      return false;
    }

    if (is$8(node, "bpmn:EndEvent")) {
      return false;
    }

    if (is$8(node, "bpmn:BoundaryEvent") && isCompensationEvent(node) && hasCompensationActivity(node)) {
      return false;
    }

    if (is$8(node, "bpmn:Task") && isForCompensation(node)) {
      return false;
    }

    return outgoing.length === 0;
  }

  function check(node, reporter) {
    if (!isAny$3(node, ["bpmn:Event", "bpmn:Activity", "bpmn:Gateway"])) {
      return;
    }

    if (isImplicitEnd(node)) {
      reporter.report(node.id, "Element is an implicit end");
    }
  }

  return { check };
};

const { is: is$7, isAny: isAny$2 } = require$$0;

/**
 * A rule that checks that an element is not an implicit start (token spawn).
 */
var noImplicitStart = () => {
  function isLinkEvent(node) {
    const eventDefinitions = node.eventDefinitions || [];

    return (
      eventDefinitions.length && eventDefinitions.every((definition) => is$7(definition, "bpmn:LinkEventDefinition"))
    );
  }

  function isImplicitStart(node) {
    const incoming = node.incoming || [];

    if (is$7(node, "bpmn:Activity") && node.isForCompensation) {
      return false;
    }

    if (is$7(node, "bpmn:SubProcess") && node.triggeredByEvent) {
      return false;
    }

    if (is$7(node, "bpmn:IntermediateCatchEvent") && isLinkEvent(node)) {
      return false;
    }

    if (isAny$2(node, ["bpmn:StartEvent", "bpmn:BoundaryEvent"])) {
      return false;
    }

    return incoming.length === 0;
  }

  function check(node, reporter) {
    if (!isAny$2(node, ["bpmn:Event", "bpmn:Activity", "bpmn:Gateway"])) {
      return;
    }

    if (isImplicitStart(node)) {
      reporter.report(node.id, "Element is an implicit start");
    }
  }

  return { check };
};

const disallowNodeType = helper.disallowNodeType;

var noInclusiveGateway = disallowNodeType("bpmn:InclusiveGateway");

const { is: is$6 } = require$$0;

/**
 * Rule that checks if two elements overlap except:
 * - Boundary events overlap their host
 * - Child elements overlap / are on top of their parent (e.g., elements within a subProcess)
 */
var noOverlappingElements = () => {
  function check(node, reporter) {
    if (!is$6(node, "bpmn:Definitions")) {
      return;
    }

    const rootElements = node.rootElements || [];
    const elementsToReport = new Set();
    const elementsOutsideToReport = new Set();
    const diObjects = getAllDiObjects(node);
    const processElementsParentDiMap = new Map(); // map with sub/process as key and its parent boundary di object

    rootElements
      .filter((element) => is$6(element, "bpmn:Collaboration"))
      .forEach((collaboration) => {
        const participants = collaboration.participants || [];
        checkElementsArray(participants, elementsToReport, diObjects);

        participants.forEach((participant) => {
          processElementsParentDiMap.set(participant.processRef, diObjects.get(participant));
        });
      });

    rootElements
      .filter((element) => is$6(element, "bpmn:Process"))
      .forEach((process) => {
        const parentDi = processElementsParentDiMap.get(process) || {};
        checkProcess(process, elementsToReport, elementsOutsideToReport, diObjects, parentDi);
      });

    // report elements
    elementsToReport.forEach((element) => reporter.report(element.id, "Element overlaps with other element"));
    elementsOutsideToReport.forEach((element) => reporter.report(element.id, "Element is outside of parent boundary"));
  }

  return {
    check: check,
  };
};

// helpers /////////////////

/**
 * Recursively check subprocesses in a process
 * @param {Object} node Process or SubProcess
 * @param {Set} elementsToReport
 * @param {Set} elementsOutsideToReport
 * @param {Map} diObjects
 */
function checkProcess(node, elementsToReport, elementsOutsideToReport, diObjects, parentDi) {
  const flowElements = node.flowElements || [];

  const flowElementsWithDi = flowElements.filter((element) => diObjects.has(element));

  // check child elements for overlap
  checkElementsArray(flowElementsWithDi, elementsToReport, diObjects);

  // check child elements outside parent boundary
  //
  //   * data objects do not have a visual representation
  //   * for historical reasons data store references may be
  //     outside of parent boundaries
  //
  flowElementsWithDi.forEach((element) => {
    if (
      !is$6(element, "bpmn:DataStoreReference") &&
      isOutsideParentBoundary(diObjects.get(element).bounds, parentDi.bounds)
    ) {
      elementsOutsideToReport.add(element);
    }
  });

  // recurse into subprocesses
  const subProcesses = flowElements.filter((element) => is$6(element, "bpmn:SubProcess"));
  subProcesses.forEach((subProcess) => {
    const subProcessDi = diObjects.get(subProcess) || {};
    const subProcessParentBoundary = subProcessDi.isExpanded ? subProcessDi : {};
    checkProcess(subProcess, elementsToReport, elementsOutsideToReport, diObjects, subProcessParentBoundary);
  });
}

/**
 * @param {Array} elements
 * @param {Set} elementsToReport
 */
function checkElementsArray(elements, elementsToReport, diObjects) {
  for (let i = 0; i < elements.length - 1; i++) {
    const element = elements[i];

    for (let j = i + 1; j < elements.length; j++) {
      const element2 = elements[j];

      // ignore if Boundary events overlap their host
      // but still check if they overlap other elements
      if (element.attachedToRef === element2 || element2.attachedToRef === element) {
        continue;
      }

      const bounds1 = diObjects.get(element)?.bounds;
      const bounds2 = diObjects.get(element2)?.bounds;

      // ignore if an element doesn't have bounds
      if (!bounds1 || !bounds2) {
        continue;
      }

      if (isCollision(bounds1, bounds2)) {
        elementsToReport.add(element);
        elementsToReport.add(element2);
      }
    }
  }
}

/**
 * Check if child element is outside of parent boundary
 */
function isOutsideParentBoundary(childBounds, parentBounds) {
  if (!isValidShapeElement(childBounds) || !isValidShapeElement(parentBounds)) {
    return false;
  }

  const isTopLeftCornerInside = childBounds.x >= parentBounds.x && childBounds.y >= parentBounds.y;
  const isBottomRightCornerInside =
    childBounds.x + childBounds.width <= parentBounds.x + parentBounds.width &&
    childBounds.y + childBounds.height <= parentBounds.y + parentBounds.height;
  const isInside = isTopLeftCornerInside && isBottomRightCornerInside;

  return !isInside;
}

/**
 * Check if two rectangle shapes collides
 */
function isCollision(firstBounds, secondBounds) {
  if (!isValidShapeElement(firstBounds) || !isValidShapeElement(secondBounds)) {
    return false;
  }

  const collisionX =
    firstBounds.x + firstBounds.width >= secondBounds.x && secondBounds.x + secondBounds.width >= firstBounds.x;
  const collisionY =
    firstBounds.y + firstBounds.height >= secondBounds.y && secondBounds.y + secondBounds.height >= firstBounds.y;

  // collision on both axis
  return collisionX && collisionY;
}

/**
 * Checks if shape bounds has all necessary values for collision check
 */
function isValidShapeElement(bounds) {
  return (
    !!bounds &&
    is$6(bounds, "dc:Bounds") &&
    typeof bounds.x === "number" &&
    typeof bounds.y === "number" &&
    typeof bounds.width === "number" &&
    typeof bounds.height === "number"
  );
}

/**
 * Get all di object as one map object
 * @param {Object} node bpmn:Definitions
 * @returns {Map<Object, Object>} map of di objects with element as key
 */
function getAllDiObjects(node) {
  const diObjects = new Map();
  const diagrams = node.diagrams || [];

  diagrams
    .filter((diagram) => !!diagram.plane)
    .forEach((diagram) => {
      const planeElements = diagram.plane.planeElement || [];
      planeElements
        .filter((planeElement) => !!planeElement.bpmnElement)
        .forEach((planeElement) => {
          diObjects.set(planeElement.bpmnElement, planeElement);
        });
    });

  return diObjects;
}

const { is: is$5 } = require$$0;

/**
 * A rule that checks whether not more than one blank start event
 * exists per scope.
 */
var singleBlankStartEvent = () => {
  function check(node, reporter) {
    if (!is$5(node, "bpmn:FlowElementsContainer")) {
      return;
    }

    const flowElements = node.flowElements || [];

    const blankStartEvents = flowElements.filter((flowElement) => {
      if (!is$5(flowElement, "bpmn:StartEvent")) {
        return false;
      }

      const eventDefinitions = flowElement.eventDefinitions || [];

      return eventDefinitions.length === 0;
    });

    if (blankStartEvents.length > 1) {
      const type = is$5(node, "bpmn:SubProcess") ? "Sub process" : "Process";

      reporter.report(node.id, type + " has multiple blank start events");
    }
  }

  return {
    check,
  };
};

const { is: is$4 } = require$$0;

/**
 * A rule that verifies that an event contains maximum one event definition.
 */
var singleEventDefinition = () => {
  function check(node, reporter) {
    if (!is$4(node, "bpmn:Event")) {
      return;
    }

    const eventDefinitions = node.eventDefinitions || [];

    if (eventDefinitions.length > 1) {
      reporter.report(node.id, "Event has multiple event definitions", ["eventDefinitions"]);
    }
  }

  return {
    check,
  };
};

const { is: is$3, isAny: isAny$1 } = require$$0;

/**
 * A rule that checks for the presence of a start event per scope.
 */
var startEventRequired = () => {
  function hasStartEvent(node) {
    const flowElements = node.flowElements || [];

    return flowElements.some((node) => is$3(node, "bpmn:StartEvent"));
  }

  function check(node, reporter) {
    if (!isAny$1(node, ["bpmn:Process", "bpmn:SubProcess"])) {
      return;
    }

    if (!hasStartEvent(node)) {
      const type = is$3(node, "bpmn:SubProcess") ? "Sub process" : "Process";

      reporter.report(node.id, type + " is missing start event");
    }
  }

  return { check };
};

const { is: is$2 } = require$$0;

/**
 * A rule that checks that start events inside a normal sub-processes
 * are blank (do not have an event definition).
 */
var subProcessBlankStartEvent = () => {
  function check(node, reporter) {
    if (!is$2(node, "bpmn:SubProcess") || node.triggeredByEvent) {
      return;
    }

    const flowElements = node.flowElements || [];

    flowElements.forEach((flowElement) => {
      if (!is$2(flowElement, "bpmn:StartEvent")) {
        return false;
      }

      const eventDefinitions = flowElement.eventDefinitions || [];

      if (eventDefinitions.length > 0) {
        reporter.report(flowElement.id, "Start event must be blank", ["eventDefinitions"]);
      }
    });
  }

  return {
    check,
  };
};

const { is: is$1 } = require$$0;

/**
 * A rule that checks, whether a gateway has only one source and target.
 *
 * Those gateways are superfluous since they don't do anything.
 */
var superfluousGateway = () => {
  function check(node, reporter) {
    if (!is$1(node, "bpmn:Gateway")) {
      return;
    }

    const incoming = node.incoming || [];
    const outgoing = node.outgoing || [];

    if (incoming.length === 1 && outgoing.length === 1) {
      reporter.report(node.id, "Gateway is superfluous. It only has one source and target.");
    }
  }

  return {
    check,
  };
};

const { is, isAny } = require$$0;

/**
 * A rule that checks, whether a gateway has only one source and target.
 *
 * Those gateways are superfluous since they don't do anything.
 */
var superfluousTermination = () => {
  function check(node, reporter) {
    if (!isAny(node, ["bpmn:Process", "bpmn:SubProcess"])) {
      return;
    }

    const flowElements = node.flowElements || [];

    const ends = flowElements.filter(
      (element) => is(element, "bpmn:FlowNode") && (element.outgoing || []).length === 0
    );

    const terminateEnds = ends.filter(isTerminateEnd);

    if (terminateEnds.length !== 1) {
      // TODO(nikku): only detect basic cases, do not
      // do any kinds of elaborate flow analysis
      return;
    }

    const superfluous = ends.every((end) => isInterruptingEventSub(end) || isTerminateEnd(end));

    if (superfluous) {
      for (const node of terminateEnds) {
        reporter.report(node.id, "Termination is superfluous.");
      }
    }
  }

  return {
    check,
  };
};

function isTerminateEnd(element) {
  return (
    is(element, "bpmn:EndEvent") &&
    (element.eventDefinitions || []).some((eventDefinition) => is(eventDefinition, "bpmn:TerminateEventDefinition"))
  );
}

function isInterruptingEventSub(element) {
  const isEventSub = is(element, "bpmn:SubProcess") && element.triggeredByEvent;

  return (
    isEventSub &&
    (element.flowElements || []).some((element) => is(element, "bpmn:StartEvent") && element.isInterrupting)
  );
}

const cache = {};

/**
 * A resolver that caches rules and configuration as part of the bundle,
 * making them accessible in the browser.
 *
 * @param {Object} cache
 */
function Resolver() {}

Resolver.prototype.resolveRule = (pkg, ruleName) => {
  const rule = cache[pkg + "/" + ruleName];

  if (!rule) {
    throw new Error("cannot resolve rule <" + pkg + "/" + ruleName + ">: not bundled");
  }

  return rule;
};

Resolver.prototype.resolveConfig = (pkg, configName) => {
  throw new Error("cannot resolve config <" + configName + "> in <" + pkg + ">: not bundled");
};

const resolver = new Resolver();

const rules = {
  "conditional-flows": "error",
  "end-event-required": "error",
  "event-sub-process-typed-start-event": "error",
  "fake-join": "warn",
  global: "warn",
  "label-required": "error",
  "link-event": "error",
  "no-bpmndi": "error",
  "no-complex-gateway": "error",
  "no-disconnected": "error",
  "no-duplicate-sequence-flows": "error",
  "no-gateway-join-fork": "error",
  "no-implicit-split": "error",
  "no-implicit-end": "warn",
  "no-implicit-start": "error",
  "no-inclusive-gateway": "error",
  "no-overlapping-elements": "warn",
  "single-blank-start-event": "error",
  "single-event-definition": "error",
  "start-event-required": "error",
  "sub-process-blank-start-event": "error",
  "superfluous-gateway": "warn",
  "superfluous-termination": "warn",
};

const config = {
  rules: rules,
};

const bundle = {
  resolver: resolver,
  config: config,
};

cache["bpmnlint/conditional-flows"] = conditionalFlows;

cache["bpmnlint/end-event-required"] = endEventRequired;

cache["bpmnlint/event-sub-process-typed-start-event"] = eventSubProcessTypedStartEvent;

cache["bpmnlint/fake-join"] = fakeJoin;

cache["bpmnlint/global"] = global;

cache["bpmnlint/label-required"] = labelRequired;

cache["bpmnlint/link-event"] = linkEvent;

cache["bpmnlint/no-bpmndi"] = noBpmndi;

cache["bpmnlint/no-complex-gateway"] = noComplexGateway;

cache["bpmnlint/no-disconnected"] = noDisconnected;

cache["bpmnlint/no-duplicate-sequence-flows"] = noDuplicateSequenceFlows;

cache["bpmnlint/no-gateway-join-fork"] = noGatewayJoinFork;

cache["bpmnlint/no-implicit-split"] = noImplicitSplit;

cache["bpmnlint/no-implicit-end"] = noImplicitEnd;

cache["bpmnlint/no-implicit-start"] = noImplicitStart;

cache["bpmnlint/no-inclusive-gateway"] = noInclusiveGateway;

cache["bpmnlint/no-overlapping-elements"] = noOverlappingElements;

cache["bpmnlint/single-blank-start-event"] = singleBlankStartEvent;

cache["bpmnlint/single-event-definition"] = singleEventDefinition;

cache["bpmnlint/start-event-required"] = startEventRequired;

cache["bpmnlint/sub-process-blank-start-event"] = subProcessBlankStartEvent;

cache["bpmnlint/superfluous-gateway"] = superfluousGateway;

cache["bpmnlint/superfluous-termination"] = superfluousTermination;

export { config, bundle as default, resolver };
