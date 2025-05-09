"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchSkins = fetchSkins;
exports.fetchItems = fetchItems;
exports.fetchShop = fetchShop;
exports.fetchAll = fetchAll;
const BASE_URL = 'https://fortnite-api.com/v2/cosmetics/br';
function fetchSkins() {
    return __awaiter(this, arguments, void 0, function* (limit = 40) {
        const response = yield fetch(BASE_URL);
        const data = yield response.json();
        return data.data.filter((item) => item.type.value === 'outfit').slice(0, limit);
    });
}
function fetchItems() {
    return __awaiter(this, arguments, void 0, function* (limit = 40) {
        const response = yield fetch(BASE_URL);
        const data = yield response.json();
        const validItems = data.data.filter((item) => item.images && item.images.icon);
        return validItems.slice(0, limit);
    });
}
function fetchShop() {
    return __awaiter(this, arguments, void 0, function* (limit = 40) {
        const response = yield fetch("https://fortnite-api.com/v2/shop");
        const data = yield response.json();
        return data.data.slice(0, limit);
    });
}
function fetchAll() {
    return __awaiter(this, arguments, void 0, function* (limit = 40) {
        const response = yield fetch(BASE_URL);
        const data = yield response.json();
        return data.data.filter((item) => item.type.value !== 'outfit').slice(0, limit);
    });
}
