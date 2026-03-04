namespace Linuxdle.Domain.Exceptions;

public sealed class NotFoundException(string message) : LinuxdleException(message);
