import os
import matplotlib.pyplot as plt

plot_image_filename = "static/temp/storage_plot.png"
def get_directory_size_details(main_directory):
    '''
    :param main_directory:
    :return: list.
    description : Main function for providing directory size details and creating visual representation.
    '''
    directory_sizes = []
    directory_names_and_sizes = []

    for sub_directory in os.listdir(main_directory):
        sub_dir_path = os.path.join(main_directory, sub_directory)
        sub_directory_size = get_directory_size(sub_dir_path)
        if sub_directory_size == 0:
            continue
        directory_sizes.append(sub_directory_size)
        directory_names_and_sizes.append(os.path.basename(sub_directory) + ":"
                                         + get_file_size_format(sub_directory_size))
    pie_plot_storage_details(directory_sizes, directory_names_and_sizes)
    return  directory_names_and_sizes


def get_directory_size(directory_path):
    total_size = 0
    try:
        for entry in os.scandir(directory_path):
            if entry.is_file():
                total_size += entry.stat().st_size
            elif entry.is_dir():
                total_size += get_directory_size(entry.path)
    except NotADirectoryError:
        return os.path.getsize(directory_path)
    except PermissionError or FileNotFoundError:
        # return Exception TODO
        return 0
    return total_size


def get_file_size_format(b, factor=1024, suffix="B"):
    for unit in ["", "K", "M", "G", "T", "P", "E", "Z"]:
        if b < factor:
            return f"{b:.2f} {unit}{suffix}"
        b /= factor
    return f"{b:.2F}Y{suffix}"


def pie_plot_storage_details(sizes, names):
    plt.pie(sizes, labels=names)
    plt.savefig(plot_image_filename)
    plt.close()
    # plt.show()
