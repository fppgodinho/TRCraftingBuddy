var async   = require('async');
var sqlite3 = require('sqlite3').verbose();
var db      = new sqlite3.Database('data/specdata.db3');
var fs      = require('fs');

var tasks       =   [];
var skills      =   {};
var recipes     =   {};
var components  =   {};
var filters     =   {};
var fittings    =   {};
var structures  =   {};
var items       =   {};
var species     =   {};

tasks.push(function(callback)                                                   {
    db.each("SELECT * FROM Skills", function(err, row)                          {
        skills[row.skillID]     = {
            id:             row.skillID,
            name:           row.displayName,
            description:    row.displayDescription,
            recipes:        []
        }
        expandSkill(skills[row.skillID]);
        
    }, function(){ callback(null); });
});

function expandSkill(skill)                                                     {
    tasks.push(function(callback)                                               {
        db.each("SELECT * FROM Recipes WHERE skillID ='" + skill.id + "'", function (err, row) {
            skill.recipes.push(row.recipeID);
        }, function(){ checkSkillType(skill); callback(null); });
    });
}

function checkSkillType(skill)                                                  {
    skill.crafting = (skill.recipes.length > 0);
}

tasks.push(function(callback)                                                   {
    db.each("SELECT * FROM Recipes", function(err, row)                         {
        recipes[row.recipeID]   = {
            id:                 row.recipeID,
            skill:              row.skillID,
            name:               row.displayName,
            description:        row.displayDescription,
            steps:              row.steps,
            ingredientWeight:   row.ingredientWeight,
            agentWeight:        row.agentWeight,
            ingredients:        [],
            agents:             [],
            results:            []
        }
        expandRecipe(recipes[row.recipeID]);

    }, function(){ callback(null); });
});

function expandRecipe(recipe)                                                    {
    tasks.push(function(callback)                                               {
        db.each("SELECT * FROM Recipe_Ingredients WHERE recipeID ='" + recipe.id + "'", function (err, row) {
            recipe.ingredients[row.ingSlot-1] = {id: row.componentID, count: row.count, weight:row.weight};
        }, function(){ callback(null); });
    });
    tasks.push(function(callback)                                               {
        db.each("SELECT * FROM Recipe_Agents WHERE recipeID ='" + recipe.id + "'", function (err, row) {
            recipe.agents.push({id: row.componentID, count: row.count, weight:row.weight});
        }, function(){ callback(null); });
    });
    tasks.push(function(callback)                                               {
        db.each("SELECT * FROM Recipe_Results WHERE recipeID ='" + recipe.id + "'", function (err, row) {
            recipe.results.push({
                type:       row.type,
                id:         row.resultID,
                group:      row.groupID,
                filter1:    row.filter1ID,
                filter2:    row.filter2ID,
                filter3:    row.filter3ID,
                filter4:    row.filter4ID,
                grade:      row.grade,
                count:      row.count
            });
        }, function(){ callback(null); });
    });
}

tasks.push(function(callback)                                                   {
    db.each("SELECT * FROM Crafting_Components", function(err, row)             {
        components[row.componentID]   = {
            id:             row.componentID,
            name:           row.displayName,
            description:    row.displayDescription,
            icon:           row.iconID,
            items:          [],
            ingredientOf:   [],
            agentOf:        []
        }
        expandComponent(components[row.componentID]);
        
    }, function(){ callback(null); });
});

function expandComponent(component)                                             {
    tasks.push(function(callback)                                               {
        db.each("SELECT Items.itemID FROM Item_Crafting_Components" +
            " LEFT JOIN Items ON (Item_Crafting_Components.itemID == Items.itemID)" +
            " WHERE Items.itemID IS NOT NULL AND Item_Crafting_Components.componentID ='" + component.id + "'", function (err, row) {
            component.items.push(row.itemID);
        }, function(){ callback(null); });
    });
    tasks.push(function(callback)                                               {
        db.each("SELECT * FROM Recipe_Ingredients WHERE componentID ='" + component.id + "'", function (err, row) {
            component.ingredientOf.push(row.recipeID);
        }, function(){ callback(null); });
    });
    tasks.push(function(callback)                                               {
        db.each("SELECT * FROM Recipe_Agents WHERE componentID ='" + component.id + "'", function (err, row) {
            component.agentOf.push(row.recipeID);
        }, function(){ callback(null); });
    });
}

tasks.push(function(callback)                                                   {
    db.each("SELECT * FROM Crafting_Filters", function(err, row)                {
        filters[row.filterID]   = {
            id:             row.filterID,
            name:           row.displayName,
            description:    row.displayDescription,
            items:          [],
            recipes:        []
        }
        expandFilter(filters[row.filterID]);
    }, function(){ callback(null); });
});

function expandFilter(filter)                                                   {
    tasks.push(function(callback)                                               {
        db.each("SELECT DISTINCT recipeID FROM Recipe_Results WHERE (filter1ID ='" + filter.id + "' OR filter2ID ='" + filter.id + "' OR filter3ID ='" + filter.id + "' OR filter4ID ='" + filter.id + "')", function (err, row) {
            filter.recipes.push(row.recipeID);
        }, function(){ callback(null); });
    });
    tasks.push(function(callback)                                               {
        db.each("SELECT * FROM Item_Crafting_Filters WHERE filterID ='" + filter.id + "'", function (err, row) {
            filter.items.push(row.itemID);
        }, function(){ callback(null); });
    });
}

tasks.push(function(callback)                                                   {
    db.each("SELECT * FROM Species", function(err, row)                         {
        species[row.speciesID]   = {
            id:             row.speciesID,
            name:           row.displayName,
            description:    row.displayDescription,
            items:          []
        }
        expandSpecie(species[row.speciesID]);
    }, function(){ callback(null); });
});

function expandSpecie(specie)                                                   {
    tasks.push(function(callback)                                               {
        db.each("SELECT * FROM Species_Results WHERE speciesID ='" + specie.id + "'", function (err, row) {
            specie.items.push({id: row.itemID, grade: row.grade, difficulty: row.difficulty, chance: row.chance, multiplier: row.chanceMultiplier, type: row.type, group: row.groupID });
        }, function(){ callback(null); });
    });
}

tasks.push(function(callback)                                                   {
    db.each("SELECT * FROM Fittings", function(err, row)                        {
        fittings[row.fittingID]   = {
            id:             row.fittingID,
            name:           row.displayName,
            description:    row.displayDescription,
            resultOf:       []
        }
        expandFitting(fittings[row.fittingID]);
    }, function(){ callback(null); });
});

function expandFitting(fitting)                                                 {
    tasks.push(function(callback)                                               {
        db.each("SELECT DISTINCT recipeID FROM Recipe_Results WHERE  type='2' AND resultID ='" + fitting.id + "'", function (err, row) {
            fitting.resultOf.push(row.recipeID);
        }, function(){ checkFittingType(fitting); callback(null); });
    });
}

function checkFittingType(fitting)                                              {
    fitting.craftable = (fitting.resultOf.length > 0)
}

tasks.push(function(callback)                                                   {
    db.each("SELECT * FROM Structures", function(err, row)                      {
        structures[row.structureID]   = {
            id:             row.structureID,
            name:           row.displayName,
            resultOf:       []
        }
        expandStructure(structures[row.structureID]);
    }, function(){ callback(null); });
});

function expandStructure(structure)                                             {
    tasks.push(function(callback)                                               {
        db.each("SELECT DISTINCT recipeID FROM Recipe_Results WHERE  type='3' AND resultID ='" + structure.id + "'", function (err, row) {
            structure.resultOf.push(row.recipeID);
        }, function(){ checkStructureType(structure); callback(null); });
    });
}

function checkStructureType(structure)                                          {
    structure.craftable = (structure.resultOf.length > 0);
}

//*
tasks.push(function(callback)                                                   {
    db.each("SELECT * FROM Items", function(err, row)                           {
        items[row.itemID]   = {
            id:             row.itemID,
            name:           row.displayName,
            description:    row.displayDescription,
            icon:           row.iconID,
            resultOf:       [],
            species:        [],
            components:     [],
            filters:        [],
            usedIn:         []
        }
        expandItem(items[row.itemID]);
    }, function(){ callback(null); });
});

function expandItem(item)                                                       {
    tasks.push(function(callback)                                               {
        db.each("SELECT DISTINCT recipeID FROM Recipe_Results WHERE type='1' AND resultID ='" + item.id + "'", function (err, row) {
            item.resultOf.push(row.recipeID);
        }, function(){ checkItemType(item); callback(null); });
    });
    tasks.push(function(callback)                                               {
        db.each("SELECT * FROM Species_Results WHERE itemID ='" + item.id + "'", function (err, row) {
            item.species.push(row.speciesID);
        }, function(){ callback(null); });
    });
    tasks.push(function(callback)                                               {
        db.each("SELECT * FROM Item_Crafting_Components WHERE itemID ='" + item.id + "'", function (err, row) {
            item.components.push(row.componentID);
        }, function(){ callback(null); });
    });
    tasks.push(function(callback)                                               {
        db.each("SELECT * FROM Item_Crafting_Filters WHERE itemID ='" + item.id + "'", function (err, row) {
            item.filters.push(row.filterID);
        }, function(){ callback(null); });
    });
    tasks.push(function(callback)                                               {
        db.each(
            "SELECT DISTINCT Recipes.recipeID FROM Recipes" +
            " LEFT JOIN Recipe_Ingredients as ing ON (Recipes.recipeID == ing.recipeID)" +
            " LEFT JOIN Recipe_Agents as age ON (Recipes.recipeID == age.recipeID)" +
            " LEFT JOIN Crafting_Components comp ON (comp.componentID == ing.componentID OR comp.componentID == age.componentID)" +
            " LEFT JOIN Item_Crafting_Components items ON (items.componentID == comp.componentID)" +
            " WHERE items.itemID ='" + item.id + "' AND Recipes.recipeID IS NOT NULL", function (err, row) {
                item.usedIn.push(row.recipeID);
        }, function(){ callback(null); });
    });
}

function checkItemType(item)                                                    {
    item.craftable = (item.resultOf.length > 0);
}
//*/

function saveFile(name, object)                                                 {
    var str = JSON.stringify(object);
    fs.writeFile("data/" + name, str, function(){});
}

var count = 0;
async.whilst(function() { return (count < tasks.length);}, function(callback)   {
    tasks[count++](callback);
}, function(err, results)                                                       {
    saveFile('skills.json',     skills);
    saveFile('recipes.json',    recipes);
    saveFile('components.json', components);
    saveFile('filters.json',    filters);
    saveFile('species.json',    species);
    saveFile('fittings.json',   fittings);
    saveFile('structures.json', structures);
    saveFile('items.json',      items);
});

