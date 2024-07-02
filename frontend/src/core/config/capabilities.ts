/* Copyright 2024 Marimo. All rights reserved. */
import { atom } from "jotai";
import { Capabilities } from "../kernel/messages";

export const capabilitiesAtom = atom<Capabilities>({
  sql: false,
});
