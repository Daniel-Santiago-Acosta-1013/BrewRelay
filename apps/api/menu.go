package main

import (
	"net/http"
)

// MenuItem representa una bebida del catálogo con precios por tamaño.
type MenuItem struct {
	ID          string             `json:"id"`
	Name        string             `json:"name"`
	Emoji       string             `json:"emoji"`
	Description string             `json:"description"`
	Price       float64            `json:"price"`
	SizePrice   map[string]float64 `json:"sizePrice"`
}

// menu es el catálogo estático del MVP.
var menuItems = []MenuItem{
	{
		ID:          "latte",
		Name:        "Latte",
		Emoji:       "🥛",
		Description: "Espresso con leche cremosa",
		Price:       3.50,
		SizePrice:   map[string]float64{"Small": 2.80, "Medium": 3.50, "Large": 4.20},
	},
	{
		ID:          "americano",
		Name:        "Americano",
		Emoji:       "☕",
		Description: "Espresso diluido con agua caliente",
		Price:       3.00,
		SizePrice:   map[string]float64{"Small": 2.50, "Medium": 3.00, "Large": 3.60},
	},
	{
		ID:          "cappuccino",
		Name:        "Cappuccino",
		Emoji:       "☕",
		Description: "Espresso con espuma de leche",
		Price:       3.50,
		SizePrice:   map[string]float64{"Small": 2.80, "Medium": 3.50, "Large": 4.20},
	},
	{
		ID:          "mocha",
		Name:        "Mocha",
		Emoji:       "🍫",
		Description: "Espresso con chocolate y leche",
		Price:       4.00,
		SizePrice:   map[string]float64{"Small": 3.20, "Medium": 4.00, "Large": 4.80},
	},
	{
		ID:          "espresso",
		Name:        "Espresso",
		Emoji:       "⚡",
		Description: "Puro café concentrado",
		Price:       2.50,
		SizePrice:   map[string]float64{"Small": 2.00, "Medium": 2.50, "Large": 3.00},
	},
}

// priceFor devuelve el precio de una bebida+size, o 0 si no se encuentra.
func priceFor(drinkName, size string) float64 {
	for _, item := range menuItems {
		if item.Name == drinkName {
			if p, ok := item.SizePrice[size]; ok {
				return p
			}
			return item.Price
		}
	}
	return 0
}

// handleMenu responde con el catálogo de bebidas.
func (a *api) handleMenu(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}
	writeJSON(w, http.StatusOK, menuItems)
}