#2048 Game
import tkinter as tk
from tkinter import messagebox
import random

#Back-end board
class Board:
    def __init__(self):
        self.bd = [[None for _ in range(4)] for _ in range(4)]
        self.bd[0][0] = 2
        self.bd[0][1] = 2
        self.bd[0][2] = 2
        self.bd[0][3] = 2
        self.bd[1][0] = 4

    def get_text(self, r,c):
        return self.bd[r][c]
    
    def move_tiles(self, direction):
        #Right
        if direction == 'R':
            for row in self.bd:
                non_zero = [tile for tile in row if tile != None] # Get non-zero
                # Skip if no tiles to merge
                if not non_zero:
                    continue
                idx = len(non_zero) - 1
                while idx > 0:
                    print(idx)
                    if non_zero[idx] == non_zero[idx - 1]:
                        non_zero[idx] *= 2
                        non_zero.pop(idx-1)
                        #skip the next tile as already merged
                    
                    idx -= 1
                # Pad with None to maintain row length
                while len(non_zero) < len(row):
                    non_zero.insert(0, None)
                
                # Update the original row with the merged result
                for i in range(len(row)):
                    row[i] = non_zero[i]
        # Left
        if direction == 'L':
            for row in self.bd:
                non_zero = [tile for tile in row if tile!= None]
                if not non_zero:
                    continue
                idx = 0
                while idx < len(non_zero) - 1:
                    if non_zero[idx] == non_zero[idx + 1]:
                        non_zero[idx] *= 2
                        non_zero.pop(idx + 1)
                    idx += 1
                while len(non_zero) < len(row):
                    non_zero.append(None)
                for i in range(len(row)):
                    row[i] = non_zero[i]
        
        if direction == 'U':
            for col in range(4):
                column = [self.bd[row][col] for row in range(4)] #Get the column
                non_zero = [tile for tile in column if tile!= None] # Get non_zero
                if not non_zero:
                    continue
                idx = 0
                while idx < len(non_zero) - 1:
                    if non_zero[idx] == non_zero[idx + 1]:
                        non_zero[idx] *= 2
                        non_zero.pop(idx + 1)
                    idx += 1
                while len(non_zero) < len(column):
                    non_zero.append(None)
                 
                for row in range(4):
                    self.bd[row][col] = non_zero[row]
                


class Game:
    def __init__(self, tkwindow):
        self.master = tkwindow
        self.bd = Board()
        
        #Color and format (later)
        
        # Bind arrow keys
        self.master.bind('<Left>', self.key)
        self.master.bind('<Right>', self.key)
        self.master.bind('<Up>', self.key)
        self.master.bind('<Down>', self.key)

        self.play_game()

    def new_game(self):
        pass
    def play_game(self):
        #Display the content of the board
        # 
        tile_height = 100
        tile_width = 100
        tile_x = 0
        tile_y = 0
        for i in range(4):
            for j in range(4):
                val = self.bd.get_text(i,j)
                tile = tk.Label(text = val, relief = 'solid', font = 'times 16 bold') #relief = label border
                tile.place(x = tile_x, y = tile_y, height = tile_height, width = tile_width)

                tile_x += tile_width
            tile_x = 0
            tile_y += tile_height 

    def key(self, event):
        if event.keysym in ['Left', 'Right', 'Up', 'Down']:
            # Handle the key press based on direction
            direction = event.keysym[0]
            print(f"Arrow key pressed: {direction}")  # For testing
            # TODO: Add game logic for moving tiles
            self.bd.move_tiles(direction)

            #update
            self.play_game()

master = tk.Tk()
master.title("2048")
master.geometry("400x400")

game = Game(master)
master.mainloop()
#Tiles 4x4















master.mainloop()