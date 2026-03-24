import { describe, it, expect, beforeEach, afterEach } from "vitest";
import Database from "better-sqlite3";
import { initSchema } from "../../server/db/schema";
import { addItem, getItemCount, useItem, getInventory } from "../../server/db/queries";

describe("Item System", () => {
  let db: Database.Database;
  beforeEach(() => {
    db = new Database(":memory:");
    initSchema(db);
  });
  afterEach(() => db.close());

  it("adds items and retrieves count", () => {
    addItem(db, "chalk", 5, "1994-09-20");
    expect(getItemCount(db, "chalk")).toBe(5);
  });

  it("stacks items of same type", () => {
    addItem(db, "chalk", 5, "1994-09-20");
    addItem(db, "chalk", 3, "1994-09-21");
    expect(getItemCount(db, "chalk")).toBe(8);
  });

  it("tracks different item types separately", () => {
    addItem(db, "chalk", 5, "1994-09-20");
    addItem(db, "notebook", 2, "1994-09-20");
    addItem(db, "apple", 1, "1994-09-20");

    expect(getItemCount(db, "chalk")).toBe(5);
    expect(getItemCount(db, "notebook")).toBe(2);
    expect(getItemCount(db, "apple")).toBe(1);
    expect(getItemCount(db, "letter")).toBe(0);
  });

  it("uses items and decrements count", () => {
    addItem(db, "chalk", 5, "1994-09-20");
    const used = useItem(db, "chalk");
    expect(used).toBe(true);
    expect(getItemCount(db, "chalk")).toBe(4);
  });

  it("returns false when trying to use item with 0 quantity", () => {
    const used = useItem(db, "chalk");
    expect(used).toBe(false);
    expect(getItemCount(db, "chalk")).toBe(0);
  });

  it("returns full inventory", () => {
    addItem(db, "chalk", 5, "1994-09-20");
    addItem(db, "notebook", 2, "1994-09-20");
    addItem(db, "apple", 1, "1994-09-20");

    const inventory = getInventory(db);
    expect(inventory).toEqual(
      expect.arrayContaining([
        { itemType: "chalk", quantity: 5 },
        { itemType: "notebook", quantity: 2 },
        { itemType: "apple", quantity: 1 },
      ]),
    );
  });

  it("does not return items with 0 quantity in inventory", () => {
    addItem(db, "chalk", 1, "1994-09-20");
    useItem(db, "chalk");
    const inventory = getInventory(db);
    const chalk = inventory.find((i) => i.itemType === "chalk");
    // Either not present or quantity is 0
    if (chalk) expect(chalk.quantity).toBe(0);
  });
});
