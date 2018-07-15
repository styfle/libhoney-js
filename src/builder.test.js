/* global expect, describe, it */
import libhoney from "./libhoney";

describe("libhoney builder", function() {
  let hny = new libhoney();

  it("takes fields and dynamic fields in ctor", function() {
    let b = hny.newBuilder(
      { a: 5 },
      {
        b: function() {
          return 3;
        }
      }
    );
    expect(b._fields).toEqual({
      a: 5
    });
    expect(b._dyn_fields).toEqual({
      b: expect.any(Function)
    });

    b = hny.newBuilder();
    expect(Object.getOwnPropertyNames(b._fields)).toEqual([]);
    expect(Object.getOwnPropertyNames(b._dyn_fields)).toEqual([]);
  });

  it("accepts dict-like arguments to .add()", function() {
    let b;
    let ev;

    b = hny.newBuilder();
    b.add({ a: 5 });
    ev = b.newEvent();
    expect(ev.data).toMatchObject({
      a: 5
    });

    let map = new Map();
    map.set("a", 5);
    b = hny.newBuilder();
    b.add(map);
    ev = b.newEvent();
    expect(ev.data).toMatchObject({
      a: 5
    });
  });

  it("doesn't stringify object values", function() {
    let honey = new libhoney({
      apiHost: "http://foo/bar",
      apiKey: "12345",
      dataset: "testing",
      transmission: "mock"
    });
    let transmission = honey.transmission;

    let postData = { a: { b: 1 }, c: { d: 2 } };

    let builder = honey.newBuilder({ a: { b: 1 } });

    builder.sendNow({ c: { d: 2 } });

    expect(transmission.events).toMatchObject([
      {
        postData: JSON.stringify(postData)
      }
    ]);
  });

  it("includes snapshot of global fields/dyn_fields", function() {
    let honey = new libhoney({
      apiHost: "http://foo/bar",
      apiKey: "12345",
      dataset: "testing",
      transmission: "mock"
    });
    let transmission = honey.transmission;

    let postData = { b: 2, c: 3 };

    let builder = honey.newBuilder({ b: 2 });

    // add a global field *after* creating the builder.  it shouldn't show up in the post data
    honey.addField("a", 1);

    builder.sendNow({ c: 3 });

    expect(transmission.events).toMatchObject([
      {
        postData: JSON.stringify(postData)
      }
    ]);

    // but if we create another builder, it should show up in the post data.
    let postData2 = { a: 1, b: 2, c: 3 };

    builder = honey.newBuilder({ b: 2 });

    builder.sendNow({ c: 3 });

    expect(transmission.events).toMatchObject([
      {
        postData: JSON.stringify(postData)
      },
      {
        postData: JSON.stringify(postData2)
      }
    ]);
  });
});